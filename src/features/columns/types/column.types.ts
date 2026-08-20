import type { Timestamp } from "firebase/firestore";

export interface Column {
  id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
