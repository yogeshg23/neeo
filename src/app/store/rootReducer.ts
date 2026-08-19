import { combineReducers } from "@reduxjs/toolkit";

import { baseApi } from "../../services/api/baseApi";

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
});