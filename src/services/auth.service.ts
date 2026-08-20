import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db,  } from "../config/firebase";
import type { AuthUser } from "../types/auth";


const googleProvider = new GoogleAuthProvider();

/**
 * Create/update Firestore user document
 */
export const ensureUserDocument = async (user: User, provider = "password") => {
  const userRef = doc(db, "users", user.uid);

  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    await setDoc(userRef, {
      id: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      role: "user",
      provider,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(
      userRef,
      {
        id: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        role: "user",
        updatedAt: serverTimestamp(),
      },
      {
        merge: true,
      }
    );
  }

  const updatedSnapshot = await getDoc(userRef);

  return {
    id: updatedSnapshot.id,
    email: user.email,
    displayName: user.displayName || "",
    role: "user",
    provider,
    ...updatedSnapshot.data(),
  } as AuthUser;
};

/**
 * Google login
 */
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);

  const user = result.user;

  const firestoreUser = await ensureUserDocument(user, "google");

  return {
    firebaseUser: user,
    user: firestoreUser,
  };
};

/**
 * Email/password login
 */
export const loginWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = result.user;

  const firestoreUser = await ensureUserDocument(user, "password");

  return {
    firebaseUser: user,
    user: firestoreUser,
  };
};

/**
 * Email/password registration
 */
export const registerWithEmail = async (email: string, password: string) => {
  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = result.user;

  const firestoreUser = await ensureUserDocument(user, "password");

  return {
    firebaseUser: user,
    user: firestoreUser,
  };
};

/**
 * Logout
 */
export const logoutUser = async () => {
  await signOut(auth);
};

export const subscribeToAuthState = (
  callback: (user: User | null) => void,
) => onAuthStateChanged(auth, callback);