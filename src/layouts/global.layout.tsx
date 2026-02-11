import { AuthProvider } from "@/contexts/auth.context";
import { type FC } from "react";
import { Outlet } from "react-router-dom";

const GlobalLayout: FC = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export default GlobalLayout;
