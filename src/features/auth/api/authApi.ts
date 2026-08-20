import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../../../config/firebase";

const saveUserProfile = async (user: {
  uid: string;
  email: string | null;
  displayName?: string | null;
}, includeCreatedAt = false) => {
  await setDoc(
    doc(db, "users", user.uid),
    {
      id: user.uid,
      email: user.email,
      ...(user.displayName && { displayName: user.displayName }),
      role: "user",
      ...(includeCreatedAt && {
        createdAt: serverTimestamp(),
      }),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const registerUser = async (
  email: string,
  password: string,
) => {
  const credentials = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  await saveUserProfile(credentials.user, true);
  return credentials;
};

export const loginUser = async (
  email: string,
  password: string,
) => {
  const credentials = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  await saveUserProfile(credentials.user);
  return credentials;
};

export const logoutUser = async () => {
  return signOut(auth);
};

export const updateUserProfile = async (displayName: string) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be signed in to edit your profile.");
  }

  await updateProfile(user, { displayName });
  await saveUserProfile(user);
};