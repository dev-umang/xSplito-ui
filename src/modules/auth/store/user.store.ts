import type { UserProfile } from "../types/user.types";
import { create } from "zustand";

type UserStoreType = {
  userDetails: UserProfile | null;
  loading: boolean;
  actions: {
    setUserDetails: (user: UserProfile | null) => void;
    setLoading: (loading: boolean) => void;
    updateUserDetails: (updates: Partial<UserProfile>) => void;
  };
};

export const useUserStore = create<UserStoreType>((set) => ({
  userDetails: null,
  loading: true,
  actions: {
    setUserDetails: (user) => set({ userDetails: user, loading: false }),
    setLoading: (loading) => set({ loading }),
    updateUserDetails: (updates) =>
      set((state) => ({
        userDetails: state.userDetails
          ? { ...state.userDetails, ...updates }
          : null,
      })),
  },
}));

export const useUserDetails = () => useUserStore((state) => state.userDetails);
export const useUserLoading = () => useUserStore((state) => state.loading);
export const useUserActions = () => useUserStore((state) => state.actions);
