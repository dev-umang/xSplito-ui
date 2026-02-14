import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useDarkMode, useThemeActions } from "@/configs/theme/theme.store";
import { Moon, Sun, User, Settings, LogOut } from "lucide-react";
import { type FC, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/configs/navigation/navigation.constants";
import { useUserDetails } from "@/modules/auth/store/user.store";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { AuthContext } from "@/contexts/auth.context";
import { useReceivedRequests } from "@/modules/friends/store/friends.store";

const MainHeader: FC = () => {
  const { updatePreferences } = useThemeActions();
  const darkMode = useDarkMode();
  const navigate = useNavigate();
  const userDetails = useUserDetails();
  const authUser = useAuthUser();
  const authContext = useContext(AuthContext);
  const receivedRequests = useReceivedRequests();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold cursor-pointer" onClick={() => navigate(ROUTES.DASHBOARD)}>
            xSplito
          </h3>
          <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate(ROUTES.DASHBOARD)}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => navigate(ROUTES.GROUPS)}>
              Groups
            </Button>
            <Button variant="ghost" className="relative" onClick={() => navigate(ROUTES.FRIENDS)}>
              Friends
              {receivedRequests.length > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {receivedRequests.length}
                </Badge>
              )}
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => updatePreferences(darkMode ? "light" : "dark")}
            className="hidden md:flex"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </Button>

          {/* User Menu - Desktop Only */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hidden md:flex">
                <Avatar>
                  <AvatarImage src={authUser?.photoURL || ""} />
                  <AvatarFallback>
                    {userDetails ? getInitials(userDetails.displayName) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userDetails?.displayName || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userDetails?.email || authUser?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(ROUTES.SETTINGS)}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => authContext.logout?.()}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
