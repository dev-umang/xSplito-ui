import { fbAuth } from "@/configs/firebase/firebase.config";
import { useListenAuthState } from "@/modules/auth/hooks/useListenAuthState";
import useListenUserDetails from "@/modules/auth/hooks/useListenUserDetails";
import { signOut } from "firebase/auth";
import type { Unsubscribe } from "firebase/firestore";
import React, {
  createContext,
  useEffect,
  useRef,
  type FC,
  type PropsWithChildren,
} from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/configs/navigation/navigation.constants";
import { useUserDetails, useUserLoading } from "@/modules/auth/store/user.store";
import { useListenFriends } from "@/modules/friends/hooks/useListenFriends";

type AuthContextType = Partial<{
  logout: () => void;
}>;

const AuthContext = createContext<AuthContextType>({});

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const userListen = useRef<Unsubscribe | null>(null);
  const { loggedInUid } = useListenAuthState();
  const { listenUserDetails } = useListenUserDetails();
  const userDetails = useUserDetails();
  const userLoading = useUserLoading();
  const navigate = useNavigate();
  const hasCheckedProfile = useRef(false);

  // Start listening to friends
  useListenFriends();

  const offListener = () => {
    if (userListen.current) {
      console.log("User details listener removed");
      userListen.current();
      userListen.current = null;
    }
  };

  useEffect(() => {
    if (loggedInUid) {
      userListen.current = listenUserDetails(loggedInUid);
      hasCheckedProfile.current = false;
    } else {
      offListener();
      hasCheckedProfile.current = false;
    }
    return () => offListener();
  }, [listenUserDetails, loggedInUid]);

  // Check profile completion and redirect if needed
  useEffect(() => {
    if (
      loggedInUid &&
      !userLoading &&
      !hasCheckedProfile.current &&
      window.location.pathname !== ROUTES.PROFILE_SETUP
    ) {
      hasCheckedProfile.current = true;

      // If user document doesn't exist or profile not completed
      if (!userDetails || !userDetails.profileCompleted) {
        console.log("Profile incomplete, redirecting to setup");
        navigate(ROUTES.PROFILE_SETUP, { replace: true });
      }
    }
  }, [loggedInUid, userDetails, userLoading, navigate]);

  const logout = () => {
    signOut(fbAuth)
      .then(() => {})
      .catch((error) => {
        console.error("Sign Out Error:", error);
      });
  };

  return (
    <AuthContext.Provider value={{ logout }}>{children}</AuthContext.Provider>
  );
};

export { AuthContext };

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
