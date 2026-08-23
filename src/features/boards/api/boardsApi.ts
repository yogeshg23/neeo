import { baseApi } from "../../../services/api/baseApi";
import {
  createColumn,
  createBoard,
  createTask,
  deleteBoard,
  deleteTask,
  getBoard,
  getBoards,
  moveTask,
  moveColumns,
  updateBoard,
  updateTask,
} from "../../../services/board.service";
import type { Board } from "../types/board.types";
import type { Column } from "../../columns/types/column.types";
import type { Task } from "../../tasks/types/task.types";
import type { PositionUpdate } from "../../tasks/utils/position";
import type { BoardDetails } from "../../../services/board.service";

const firebaseError = (error: unknown) => ({
  status: "FIREBASE_ERROR",
  error: error instanceof Error ? error.message : "Unable to access boards.",
});

export const boardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBoards: builder.query<Board[], void>({
      queryFn: async () => {
        try {
          return { data: await getBoards() };
        } catch (error) {
          return { error: firebaseError(error) };
        }
      },
      providesTags: ["Board"],
    }),

    getBoard: builder.query<BoardDetails, string>({
      queryFn: async (boardId) => {
        try {
          return { data: await getBoard(boardId) };
        } catch (error) {
          return { error: firebaseError(error) };
        }
      },
      providesTags: (_result, _error, boardId) => [
        { type: "Board", id: boardId },
      ],
    }),

    createBoard: builder.mutation<Board, { title: string; description?: string }>({
      queryFn: async ({ title, description }) => {
        try {
          return { data: await createBoard(title, description) };
        } catch (error) {
          return { error: firebaseError(error) };
        }
      },
      invalidatesTags: ["Board"],
    }),

    updateBoard: builder.mutation<
      void,
      { boardId: string; title: string; description: string }
    >({
      queryFn: async ({ boardId, title, description }) => {
        try {
          await updateBoard(boardId, { title, description });
          return { data: undefined };
        } catch (error) {
          return { error: firebaseError(error) };
        }
      },
      invalidatesTags: (_result, _error, { boardId }) => [
        "Board",
        { type: "Board", id: boardId },
      ],
    }),

    deleteBoard: builder.mutation<void, string>({
      queryFn: async (boardId) => {
        try {
          await deleteBoard(boardId);
          return { data: undefined };
        } catch (error) {
          return { error: firebaseError(error) };
        }
      },
      invalidatesTags: ["Board"],
    }),

    createColumn: builder.mutation<
      Column,
      { boardId: string; title: string; position: number }
    >({
      queryFn: async ({ boardId, title, position }) => {
        try {
          return { data: await createColumn(boardId, title, position) };
        } catch (error) {
          return { error: firebaseError(error) };
        }
      },
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board", id: boardId },
      ],
    }),

    createTask: builder.mutation<
      Task,
      { boardId: string; columnId: string; title: string }
    >({
      queryFn: async ({ boardId, columnId, title }) => {
        try {
          return { data: await createTask(boardId, columnId, title) };
        } catch (error) {
          return { error: firebaseError(error) };
        }
      },
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board", id: boardId },
      ],
    }),

    moveColumns: builder.mutation<
      void,
      { boardId: string; columnPositions: PositionUpdate[] }
    >({
      queryFn: async ({ boardId, columnPositions }) => {
        try {
          await moveColumns(boardId, columnPositions);
          return { data: undefined };
        } catch (error) {
          return { error: firebaseError(error) };
        }
      },
      async onQueryStarted(
        { boardId, columnPositions },
        { dispatch, queryFulfilled },
      ) {
        const patchResult = dispatch(
          boardsApi.util.updateQueryData("getBoard", boardId, (draft) => {
            const positionById = new Map(
              columnPositions.map(({ id, position }) => [id, position]),
            );

            draft.columns = [...draft.columns]
              .map((column) => ({
                ...column,
                position: positionById.get(column.id) ?? column.position,
              }))
              .sort((left, right) => left.position - right.position);
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board", id: boardId },
      ],
    }),

    updateTask: builder.mutation<
      void,
      { boardId: string; columnId: string; taskId: string; title: string }
    >({
      queryFn: async ({ boardId, columnId, taskId, title }) => {
        try {
          await updateTask(boardId, columnId, taskId, title);
          return { data: undefined };
        } catch (error) {
          return { error: firebaseError(error) };
        }
      },
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board", id: boardId },
      ],
    }),

    moveTask: builder.mutation<
      void,
      {
        boardId: string;
        taskId: string;
        sourceColumnId: string;
        destinationColumnId: string;
        sourceTaskPositions: PositionUpdate[];
        destinationTaskPositions: PositionUpdate[];
      }
    >({
      queryFn: async ({
        boardId,
        taskId,
        sourceColumnId,
        destinationColumnId,
        sourceTaskPositions,
        destinationTaskPositions,
      }) => {
        try {
          await moveTask(
            boardId,
            taskId,
            sourceColumnId,
            destinationColumnId,
            sourceTaskPositions,
            destinationTaskPositions,
          );
          return { data: undefined };
        } catch (error) {
          return { error: firebaseError(error) };
        }
      },
      async onQueryStarted(
        {
          boardId,
          taskId,
          sourceColumnId,
          destinationColumnId,
          sourceTaskPositions,
          destinationTaskPositions,
        },
        { dispatch, queryFulfilled },
      ) {
        const patchResult = dispatch(
          boardsApi.util.updateQueryData("getBoard", boardId, (draft) => {
            const sourceColumn = draft.columns.find(
              (column) => column.id === sourceColumnId,
            );
            const destinationColumn = draft.columns.find(
              (column) => column.id === destinationColumnId,
            );

            if (!sourceColumn || !destinationColumn) return;

            const taskById = new Map(
              [...sourceColumn.tasks, ...destinationColumn.tasks].map((task) => [
                task.id,
                task,
              ]),
            );
            const movedTask = taskById.get(taskId);

            if (movedTask && sourceColumnId !== destinationColumnId) {
              movedTask.columnId = destinationColumnId;
            }

            sourceColumn.tasks = sourceTaskPositions
              .map(({ id }) => taskById.get(id))
              .filter((task): task is NonNullable<typeof task> => Boolean(task));
            destinationColumn.tasks = destinationTaskPositions
              .map(({ id }) => taskById.get(id))
              .filter((task): task is NonNullable<typeof task> => Boolean(task));

            const positionById = new Map(
              [...sourceTaskPositions, ...destinationTaskPositions].map(
                ({ id, position }) => [id, position],
              ),
            );
            [...sourceColumn.tasks, ...destinationColumn.tasks].forEach((task) => {
              const position = positionById.get(task.id);
              if (position !== undefined) task.position = position;
            });
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board", id: boardId },
      ],
    }),

    deleteTask: builder.mutation<
      void,
      { boardId: string; columnId: string; taskId: string }
    >({
      queryFn: async ({ boardId, columnId, taskId }) => {
        try {
          await deleteTask(boardId, columnId, taskId);
          return { data: undefined };
        } catch (error) {
          return { error: firebaseError(error) };
        }
      },
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board", id: boardId },
      ],
    }),
  }),
});

export const {
  useCreateColumnMutation,
  useCreateBoardMutation,
  useCreateTaskMutation,
  useDeleteBoardMutation,
  useDeleteTaskMutation,
  useGetBoardQuery,
  useGetBoardsQuery,
  useUpdateBoardMutation,
  useUpdateTaskMutation,
  useMoveTaskMutation,
  useMoveColumnsMutation,
} = boardsApi;
