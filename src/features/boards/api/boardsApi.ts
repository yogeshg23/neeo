import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { baseApi } from "../../../services/api/baseApi";
import { auth, db } from "../../../config/firebase";
import type { Board } from "../types/board.types";

const getAuthenticatedUser = () =>
  new Promise<import("firebase/auth").User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

const toBoard = (document: {
  id: string;
  data: () => Record<string, unknown>;
}): Board => ({
  id: document.id,
  ...document.data(),
} as Board);

export const boardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBoard: builder.mutation<Board, { name: string }>({
      async queryFn({ name }) {
        try {
          const user = await getAuthenticatedUser();

          if (!user) {
            return {
              error: {
                status: "AUTH_REQUIRED",
                error: "You must be signed in to create a board.",
              },
            };
          }

          const boardReference = await addDoc(
            collection(db, "boards"),
            {
              name: name.trim(),
              ownerId: user.uid,
              members: {
                [user.uid]: "owner",
              },
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
          );

          return {
            data: {
              id: boardReference.id,
              name: name.trim(),
              ownerId: user.uid,
              members: {
                [user.uid]: "owner",
              },
            },
          };
        } catch (error) {
          return {
            error: {
              status: "FIREBASE_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to create board",
            },
          };
        }
      },

      invalidatesTags: ["Board"],
    }),

    getBoards: builder.query<Board[], void>({
      async queryFn() {
        try {
          const user = await getAuthenticatedUser();

          if (!user) {
            return {
              error: {
                status: "AUTH_REQUIRED",
                error: "You must be signed in to load boards.",
              },
            };
          }

          const boardsQuery = query(
            collection(db, "boards"),
            where("ownerId", "==", user.uid),
          );
          const snapshot = await getDocs(boardsQuery);

          return {
            data: snapshot.docs.map(toBoard),
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

      async onCacheEntryAdded(
        _arg,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData },
      ) {
        try {
          await cacheDataLoaded;

          const user = await getAuthenticatedUser();
          if (!user) {
            return;
          }

          const boardsQuery = query(
            collection(db, "boards"),
            where("ownerId", "==", user.uid),
          );

          const unsubscribe = onSnapshot(boardsQuery, (snapshot) => {
            updateCachedData(() => snapshot.docs.map(toBoard));
          });

          await cacheEntryRemoved;
          unsubscribe();
        } catch {
          // The initial query reports Firebase errors through queryFn.
        }
      },

      providesTags: ["Board"],
    }),
  }),
});

export const {
  useCreateBoardMutation,
  useGetBoardsQuery,
} = boardsApi;