import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth, db } from "../config/firebase";
import type { Board } from "../features/boards/types/board.types";
import type { Column } from "../features/columns/types/column.types";
import type { Task } from "../features/tasks/types/task.types";
import type { PositionUpdate } from "../features/tasks/utils/position";

export interface BoardDetails extends Board {
  columns: Array<Column & { tasks: Task[] }>;
}

const getCurrentUser = async (): Promise<User> => {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const user = await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      unsubscribe();
      resolve(nextUser);
    });
  });

  if (!user) {
    throw new Error("You must be signed in to access boards.");
  }

  return user;
};

const boardReference = (boardId: string) => doc(db, "boards", boardId);
const columnsReference = (boardId: string) =>
  collection(db, "boards", boardId, "columns");
const tasksReference = (boardId: string, columnId: string) =>
  collection(db, "boards", boardId, "columns", columnId, "tasks");

const toMillis = (value: unknown): number | undefined => {
  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof value.toMillis === "function"
  ) {
    return value.toMillis();
  }

  return typeof value === "number" ? value : undefined;
};

const toBoard = (id: string, data: Record<string, unknown>): Board => ({
  id,
  title: typeof data.title === "string" ? data.title : String(data.name ?? "Untitled board"),
  description: typeof data.description === "string" ? data.description : "",
  ownerId: String(data.ownerId ?? ""),
  members: (data.members as Board["members"] | undefined) ?? {},
  createdAt: toMillis(data.createdAt),
  updatedAt: toMillis(data.updatedAt),
});

export const getBoards = async (): Promise<Board[]> => {
  const user = await getCurrentUser();
  const snapshot = await getDocs(
    query(collection(db, "boards"), where("ownerId", "==", user.uid)),
  );

  return snapshot.docs
    .map((document) => toBoard(document.id, document.data()))
    .sort((left, right) =>
      (right.createdAt ?? 0) - (left.createdAt ?? 0),
    );
};

export const getBoard = async (boardId: string): Promise<BoardDetails> => {
  await getCurrentUser();
  const snapshot = await getDoc(boardReference(boardId));

  if (!snapshot.exists()) {
    throw new Error("Board not found.");
  }

  const board = toBoard(snapshot.id, snapshot.data());
  const columnSnapshot = await getDocs(
    query(columnsReference(boardId), orderBy("position", "asc")),
  );

  const columns = await Promise.all(
    columnSnapshot.docs.map(async (columnDocument) => {
      const taskSnapshot = await getDocs(
        query(
          tasksReference(boardId, columnDocument.id),
          orderBy("position", "asc"),
        ),
      );

      const columnData = columnDocument.data();

      return {
        id: columnDocument.id,
        boardId,
        ...(columnData as Omit<Column, "id" | "boardId">),
        createdAt: toMillis(columnData.createdAt),
        updatedAt: toMillis(columnData.updatedAt),
        tasks: taskSnapshot.docs.map((taskDocument) => {
          const taskData = taskDocument.data();

          return {
            id: taskDocument.id,
            boardId,
            columnId: columnDocument.id,
            ...(taskData as Omit<Task, "id" | "boardId" | "columnId">),
            createdAt: toMillis(taskData.createdAt),
            updatedAt: toMillis(taskData.updatedAt),
          };
        }),
      };
    }),
  );

  return { ...board, columns };
};

export const createBoard = async (
  title: string,
  description = "",
): Promise<Board> => {
  const user = await getCurrentUser();
  const boardDocument = await addDoc(collection(db, "boards"), {
    title: title.trim(),
    description: description.trim(),
    ownerId: user.uid,
    members: { [user.uid]: "owner" },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: boardDocument.id,
    title: title.trim(),
    description: description.trim(),
    ownerId: user.uid,
    members: { [user.uid]: "owner" },
  };
};

export const updateBoard = async (
  boardId: string,
  changes: Pick<Board, "title" | "description">,
) => {
  await getCurrentUser();
  await updateDoc(boardReference(boardId), {
    title: changes.title.trim(),
    description: changes.description.trim(),
    updatedAt: serverTimestamp(),
  });
};

export const createColumn = async (
  boardId: string,
  title: string,
  position: number,
): Promise<Column> => {
  await getCurrentUser();
  const columnDocument = await addDoc(columnsReference(boardId), {
    boardId,
    title: title.trim(),
    position,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: columnDocument.id,
    boardId,
    title: title.trim(),
    position,
  };
};

export const moveColumns = async (
  boardId: string,
  columnPositions: PositionUpdate[],
) => {
  await getCurrentUser();
  const batch = writeBatch(db);

  columnPositions.forEach(({ id, position }) => {
    batch.update(doc(columnsReference(boardId), id), {
      position,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

export const deleteBoard = async (boardId: string) => {
  await getCurrentUser();
  const batch = writeBatch(db);
  const columnSnapshot = await getDocs(columnsReference(boardId));

  for (const columnDocument of columnSnapshot.docs) {
    const taskSnapshot = await getDocs(
      tasksReference(boardId, columnDocument.id),
    );

    taskSnapshot.docs.forEach((taskDocument) => {
      batch.delete(taskDocument.ref);
    });
    batch.delete(columnDocument.ref);
  }

  batch.delete(boardReference(boardId));
  await batch.commit();
};

export const createTask = async (
  boardId: string,
  columnId: string,
  title: string,
): Promise<Task> => {
  await getCurrentUser();
  const lastTaskSnapshot = await getDocs(
    query(
      tasksReference(boardId, columnId),
      orderBy("position", "desc"),
      limit(1),
    ),
  );
  const lastPosition = lastTaskSnapshot.docs[0]?.data().position;
  const position =
    typeof lastPosition === "number" ? lastPosition + 1000 : 1000;
  const taskDocument = await addDoc(tasksReference(boardId, columnId), {
    boardId,
    columnId,
    title: title.trim(),
    description: "",
    position,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: taskDocument.id,
    boardId,
    columnId,
    title: title.trim(),
    description: "",
    position,
  };
};

export const updateTask = async (
  boardId: string,
  columnId: string,
  taskId: string,
  title: string,
) => {
  await getCurrentUser();
  await updateDoc(doc(tasksReference(boardId, columnId), taskId), {
    title: title.trim(),
    updatedAt: serverTimestamp(),
  });
};

export const moveTask = async (
  boardId: string,
  taskId: string,
  sourceColumnId: string,
  destinationColumnId: string,
  sourceTaskPositions: PositionUpdate[],
  destinationTaskPositions: PositionUpdate[],
) => {
  await getCurrentUser();
  const batch = writeBatch(db);

  if (sourceColumnId !== destinationColumnId) {
    const sourceTaskReference = doc(tasksReference(boardId, sourceColumnId), taskId);
    const destinationTaskReference = doc(
      tasksReference(boardId, destinationColumnId),
      taskId,
    );
    const taskSnapshot = await getDoc(sourceTaskReference);

    if (!taskSnapshot.exists()) {
      throw new Error("Task not found.");
    }

    batch.set(destinationTaskReference, {
      ...taskSnapshot.data(),
      columnId: destinationColumnId,
      position: destinationTaskPositions.find((task) => task.id === taskId)
        ?.position,
      updatedAt: serverTimestamp(),
    });
    batch.delete(sourceTaskReference);
  }

  sourceTaskPositions.forEach(({ id, position }) => {
    batch.update(
      doc(tasksReference(boardId, sourceColumnId), id),
      { position, updatedAt: serverTimestamp() },
    );
  });

  if (sourceColumnId !== destinationColumnId) {
    destinationTaskPositions
      .filter(({ id }) => id !== taskId)
      .forEach(({ id, position }) => {
      batch.update(
        doc(tasksReference(boardId, destinationColumnId), id),
        {
          position,
          updatedAt: serverTimestamp(),
        },
      );
      });
  }

  await batch.commit();
};

export const deleteTask = async (
  boardId: string,
  columnId: string,
  taskId: string,
) => {
  await getCurrentUser();
  await deleteDoc(doc(tasksReference(boardId, columnId), taskId));
};

export const ensureBoardDocument = async (board: Board) => {
  await setDoc(boardReference(board.id), board, { merge: true });
};
