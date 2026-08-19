import { collection, getDocs } from "firebase/firestore";

import { baseApi } from "../../../services/api/baseApi";
import { db } from "../../../config/firebase";
import type { Board } from "../../../types/board.types";


export const boardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBoards: builder.query<Board[], void>({
      async queryFn() {
        try {
          const snapshot = await getDocs(collection(db, "boards"));
          const boards: Board[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Board[];

          return {
            data: boards,
          };
        } catch (error) {
          return {
            error: {
              status: "FIREBASE_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to fetch boards",
            },
          };
        }
      },

      providesTags: ["Board"],
    }),
  }),
});

export const { useGetBoardsQuery } = boardsApi;