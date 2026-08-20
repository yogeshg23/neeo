import {
  useEffect,
  type ReactNode,
} from "react";
import { useAppDispatch } from "../store/hooks";
import { authFailure, authStart, logout, setUser } from "../../features/auth/slice/authSlice";
import {
  ensureUserDocument,
  subscribeToAuthState,
} from "../../services/auth.service";


interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(authStart());

    const unsubscribe = subscribeToAuthState(
      async (firebaseUser) => {
        try {
          if (!firebaseUser) {
            dispatch(logout());
            return;
          }

          const provider =
            firebaseUser.providerData[0]?.providerId ===
            "google.com"
              ? "google"
              : "password";

          const user = await ensureUserDocument(
            firebaseUser,
            provider
          );

          dispatch(
            setUser({
              user,
              firebaseUser,
            })
          );
        } catch (error) {
          console.error("Auth initialization failed:", error);

          dispatch(
            authFailure(
              "Unable to initialize authentication."
            )
          );
        }
      }
    );

    return unsubscribe;
  }, [dispatch]);

  return children;
};

export default AuthProvider;