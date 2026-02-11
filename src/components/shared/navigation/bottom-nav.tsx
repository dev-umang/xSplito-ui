import { useNavigate, useLocation } from "react-router-dom";
import { Home, FolderOpen, Receipt, Users, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/configs/navigation/navigation.constants";
import { useReceivedRequests } from "@/modules/friends/store/friends.store";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const friendRequests = useReceivedRequests();

  const tabs = [
    {
      key: "dashboard",
      label: "Home",
      icon: Home,
      path: ROUTES.DASHBOARD,
      badge: 0,
    },
    {
      key: "groups",
      label: "Groups",
      icon: FolderOpen,
      path: ROUTES.GROUPS,
      badge: 0,
    },
    {
      key: "activity",
      label: "Activity",
      icon: Receipt,
      path: ROUTES.ACTIVITY,
      badge: 0,
    },
    {
      key: "friends",
      label: "Friends",
      icon: Users,
      path: ROUTES.FRIENDS,
      badge: friendRequests.length,
    },
    {
      key: "profile",
      label: "Profile",
      icon: User,
      path: ROUTES.PROFILE,
      badge: 0,
    },
  ];

  const isActive = (path: string) => {
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {tab.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                  >
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
