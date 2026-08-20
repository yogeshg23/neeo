import type { Timestamp } from "firebase/firestore";

export interface Task {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  position: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
