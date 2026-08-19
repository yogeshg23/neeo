import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../../../config/firebase";

export const registerUser = async (
  email: string,
  password: string,
) => {
  try {
    return await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (
  email: string,
  password: string,
) => {
  try {
    return await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  return signOut(auth);
};