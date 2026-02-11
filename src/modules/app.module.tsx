import { NavigationRoutes } from "@/configs/navigation/navigation.routes";
import { type FC } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

const AppModule: FC = () => {
  return (
    <>
      <RouterProvider router={createBrowserRouter(NavigationRoutes)} />
      <Toaster position="top-center" richColors />
    </>
  );
};

export default AppModule;
