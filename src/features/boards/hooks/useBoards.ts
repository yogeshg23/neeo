import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth, db } from "../../../config/firebase";
import type { Board } from "../types/board.types";

interface UseBoardsResult {
  boards: Board[];
  isLoading: boolean;
  error: Error | null;
}

export function useBoards(): UseBoardsResult {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      setIsLoading(Boolean(nextUser));
      setError(null);

      if (!nextUser) {
        setBoards([]);
      }
    });
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!user) {
      return;
    }

    const boardsQuery = query(
      collection(db, "boards"),
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(
      boardsQuery,
      (snapshot) => {
        setBoards(
          snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          })) as Board[],
        );
        setIsLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError);
        setIsLoading(false);
      },
    );
  }, [authReady, user]);

  return { boards, isLoading, error };
}
