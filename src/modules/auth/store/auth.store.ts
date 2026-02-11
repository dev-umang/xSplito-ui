import { create } from "zustand";
import type { AuthStoreType } from "../types/auth.types";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { fbAuth } from "@/configs/firebase/firebase.config";

const useAuthStore = create<AuthStoreType>((set) => ({
  authUser: null,
  actions: {
    setAuthUser: (user) => set({ authUser: user }),
    signInWithGoogle: () => {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      signInWithPopup(fbAuth, provider)
        .then((result) => {
          const user = result.user;
          set({ authUser: user });
        })
        .catch((error) => {
          console.error("Google Sign-In Error:", error);
          set({ authUser: null });
        });
    },
  },
}));

export const useAuthUser = () => useAuthStore((state) => state.authUser);

export const useAuthActions = () => useAuthStore((state) => state.actions);
