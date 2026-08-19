import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth, db } from "../../../config/firebase";

interface UseDocumentSnapshotResult<T extends DocumentData> {
  snapshot: DocumentSnapshot<T> | null;
  isLoading: boolean;
  error: Error | null;
  user: User | null;
}

export function useDocumentSnapshot<T extends DocumentData>(
  collectionName: string,
  documentId: string | undefined,
): UseDocumentSnapshotResult<T> {
  const [snapshot, setSnapshot] = useState<DocumentSnapshot<T> | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(documentId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      setSnapshot(null);
      setError(null);
      setIsLoading(Boolean(nextUser && documentId));
    });
  }, [documentId]);

  useEffect(() => {
    if (!authReady || !user || !documentId) {
      return;
    }

    return onSnapshot(
      doc(db, collectionName, documentId) as import("firebase/firestore").DocumentReference<T>,
      (nextSnapshot) => {
        setSnapshot(nextSnapshot);
        setIsLoading(false);
      },
      (snapshotError) => {
        setSnapshot(null);
        setError(snapshotError);
        setIsLoading(false);
      },
    );
  }, [authReady, collectionName, documentId, user]);

  return {
    snapshot,
    isLoading: !authReady || isLoading,
    error,
    user,
  };
}
