export interface Users {
  id: string;
  email: string | null;
  role: "user";
  createdAt?: unknown;
  updatedAt?: unknown;
}
