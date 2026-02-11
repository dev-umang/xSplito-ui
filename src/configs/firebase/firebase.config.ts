import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Initialize Firebase
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_authDomain,
  projectId: import.meta.env.VITE_FIREBASE_projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_appId,
});

export const fbAuth = getAuth(app);
export const fbStore = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(fbStore).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn(
      "Offline persistence can only be enabled in one tab at a time."
    );
  } else if (err.code === "unimplemented") {
    console.warn("The current browser doesn't support offline persistence.");
  }
});
