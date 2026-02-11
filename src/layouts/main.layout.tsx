import MainHeader from "@/components/shared/headers/main.header";
import { type FC } from "react";
import { Outlet } from "react-router-dom";

const MainLayout: FC = () => {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <MainHeader />
      <main className=" p-default grid md:grid-cols-[auto_1fr] gap-default">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
