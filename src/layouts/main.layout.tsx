import MainHeader from "@/components/shared/headers/main.header";
import BottomNav from "@/components/shared/navigation/bottom-nav";
import { type FC } from "react";
import { Outlet } from "react-router-dom";

const MainLayout: FC = () => {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <MainHeader />
      <main className="p-2 md:p-4 pb-20 lg:pb-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
