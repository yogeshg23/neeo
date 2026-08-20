import type { User as FirebaseUser } from "firebase/auth";

export type AuthProvider = "google" | "password";

export interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  provider: AuthProvider;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AuthResult {
  firebaseUser: FirebaseUser;
  user: FirestoreUser;
}