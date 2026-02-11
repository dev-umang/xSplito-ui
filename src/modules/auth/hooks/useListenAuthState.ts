import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { fbAuth } from "@/configs/firebase/firebase.config";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/configs/navigation/navigation.constants";
import { useAuthActions } from "../store/auth.store";

export const useListenAuthState = () => {
  const [loggedInUid, setLoggedInUid] = useState<string | null>(null);
  const { setAuthUser } = useAuthActions();
  const navigate = useNavigate();

  const listenAuthState = useCallback(() => {
    onAuthStateChanged(fbAuth, (user) => {
      if (user?.uid) {
        console.log(`User is logged in -> ${user.email}`);
        if (
          window.location.pathname.startsWith("/auth") ||
          window.location.pathname === "/"
        ) {
          navigate(ROUTES.DASHBOARD, { replace: true });
        }
        setAuthUser(user);
        setLoggedInUid(user.uid);
      } else {
        console.log(`User is not logged in`);

        const path = window.location.pathname;
        if (!path.startsWith("/auth")) {
          navigate(ROUTES.LOGIN, { replace: true });
        }
        setAuthUser(null);
        setLoggedInUid(null);
      }
    });
  }, [navigate, setAuthUser]);

  useEffect(() => {
    listenAuthState();
  }, [listenAuthState]);

  return { loggedInUid };
};
