import { useDocumentSnapshot } from "./useDocumentSnapshot";
import type { Board } from "../types/board.types";

interface UseBoardResult {
  board: Board | null;
  exists: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useBoard(
  boardId: string | undefined,
): UseBoardResult {
  const { snapshot, isLoading, error } =
    useDocumentSnapshot<Board>("boards", boardId);

  return {
    board: snapshot?.exists()
      ? ({
          ...snapshot.data(),
          id: snapshot.id,
        } as Board)
      : null,
    exists: snapshot?.exists() ?? false,
    isLoading,
    error,
  };
}
