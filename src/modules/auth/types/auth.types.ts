import type { UserInfo } from "firebase/auth";

export type UserType = UserInfo | null | undefined;

export type AuthStoreType = {
  authUser: UserType;
  actions: {
    signInWithGoogle: () => void;
    setAuthUser: (user: UserType) => void;
  };
};
