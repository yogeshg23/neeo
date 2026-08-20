import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "firebase/auth";

import type { AuthState, AuthUser } from "../../../types/auth";

interface AuthPayload {
  user: AuthUser;
  firebaseUser: User;
}

const initialState: AuthState = {
  user: null,
  firebaseUser: null,
  loading: false,
  initialized: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    authSuccess: (
      state,
      action: PayloadAction<AuthPayload>
    ) => {
      state.loading = false;
      state.user = action.payload.user;
      state.firebaseUser = action.payload.firebaseUser;
      state.initialized = true;
      state.error = null;
    },

    authFailure: (
      state,
      action: PayloadAction<string>
    ) => {
      state.loading = false;
      state.error = action.payload;
      state.initialized = true;
    },

    setUser: (
      state,
      action: PayloadAction<AuthPayload>
    ) => {
      state.user = action.payload.user;
      state.firebaseUser = action.payload.firebaseUser;
      state.initialized = true;
      state.error = null;
    },

    logout: (state) => {
      state.user = null;
      state.firebaseUser = null;
      state.loading = false;
      state.initialized = true;
      state.error = null;
    },
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  setUser,
  logout,
} = authSlice.actions;

export default authSlice.reducer;