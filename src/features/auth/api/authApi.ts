import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
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
}, includeCreatedAt = false) => {
  await setDoc(
    doc(db, "users", user.uid),
    {
      id: user.uid,
      email: user.email,
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