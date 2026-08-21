export interface Task {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  position: number;
  createdAt?: number;
  updatedAt?: number;
}
