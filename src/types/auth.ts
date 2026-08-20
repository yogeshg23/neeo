import type { User } from "firebase/auth";

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string;
  role: string;
  provider: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AuthState {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}