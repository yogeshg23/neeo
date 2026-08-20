import { combineReducers } from "@reduxjs/toolkit";

import { baseApi } from "../../services/api/baseApi";
import authReducer from "../../features/auth/slice/authSlice";

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
});