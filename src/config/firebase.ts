import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHswTiPovykmCBNjZk4P6gCHDNJCFMDdo",
  authDomain: "neeo-b0c30.firebaseapp.com",
  projectId: "neeo-b0c30",
  storageBucket: "neeo-b0c30.firebasestorage.app",
  messagingSenderId: "171273771169",
  appId: "1:171273771169:web:d5df96f3ab5c71770bb8e0",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);


export default app;