import { Mail, DollarSign, LogOut, Settings, Moon, Sun, Laptop } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUserDetails } from "@/modules/auth/store/user.store";
import { useAuthContext } from "@/contexts/auth.context";
import { useThemePreferences, useThemeActions } from "@/configs/theme/theme.store";

const ProfilePage = () => {
  const userDetails = useUserDetails();
  const { logout } = useAuthContext();
  const preferences = useThemePreferences();
  const { updatePreferences } = useThemeActions();

  if (!userDetails) return null;

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      JPY: "¥",
      AUD: "A$",
      CAD: "C$",
      CNY: "¥",
    };
    return symbols[currency] || currency;
  };

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userDetails.photoURL || ""} />
              <AvatarFallback className="text-2xl">
                {userDetails.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{userDetails.displayName}</h3>
              <p className="text-muted-foreground">{userDetails.email}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Default Currency</p>
                  <p className="text-sm text-muted-foreground">
                    Used for new groups
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg">
                {getCurrencySymbol(userDetails.defaultCurrency)} {userDetails.defaultCurrency}
              </Badge>
            </div>

            {userDetails.phoneNumber && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone Number</p>
                  <p className="text-sm text-muted-foreground">
                    {userDetails.phoneNumber}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={preferences === "light" ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => updatePreferences("light")}
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={preferences === "dark" ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => updatePreferences("dark")}
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={preferences === "system" ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => updatePreferences("system")}
            >
              <Laptop className="h-4 w-4" />
              System
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {}}
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={() => logout?.()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p className="font-semibold">xSplito</p>
            <p>Version 1.0.0</p>
            <p>Made with ❤️ for easy expense tracking</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
