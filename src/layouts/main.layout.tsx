import MainHeader from "@/components/shared/headers/main.header";
import BottomNav from "@/components/shared/navigation/bottom-nav";
import QuickExpenseFAB from "@/components/shared/navigation/quick-expense-fab";
import { type FC } from "react";
import { Outlet } from "react-router-dom";

const MainLayout: FC = () => {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <MainHeader />
      <main className="p-default grid md:grid-cols-[auto_1fr] gap-default pb-20 lg:pb-default">
        <Outlet />
      </main>
      <BottomNav />
      <QuickExpenseFAB />
    </div>
  );
};

export default MainLayout;
