import { fbRefs } from "@/configs/firebase/firebase.nodes";
import { onSnapshot } from "firebase/firestore";
import { useCallback } from "react";
import { useUserActions } from "../store/user.store";
import type { UserProfile } from "../types/user.types";

const useListenUserDetails = () => {
  const { setUserDetails, setLoading } = useUserActions();

  const listenUserDetails = useCallback(
    (userId: string) => {
      const userRef = fbRefs.users(userId);
      console.log(`Starting user details listener for "${userId}"`);
      setLoading(true);

      return onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data() as UserProfile;
          console.log("User Data:", userData);
          setUserDetails({
            ...userData,
            createdAt: userData.createdAt
              ? new Date(userData.createdAt)
              : new Date(),
            updatedAt: userData.updatedAt
              ? new Date(userData.updatedAt)
              : new Date(),
          });
        } else {
          console.log("No user document found - new user");
          setUserDetails(null);
        }
        setLoading(false);
      });
    },
    [setUserDetails, setLoading]
  );

  return { listenUserDetails };
};

export default useListenUserDetails;
