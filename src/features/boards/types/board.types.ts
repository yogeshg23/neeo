export type BoardRole = "owner" | "editor" | "viewer";

export interface Board {
  id: string;
  name: string;
  ownerId: string;
  members?: Record<string, BoardRole>;
  createdAt?: unknown;
  updatedAt?: unknown;
}