export type BoardRole = "owner" | "editor" | "viewer";

export interface Board {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  members: Record<string, BoardRole>;
  createdAt?: number;
  updatedAt?: number;
}