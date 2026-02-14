import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserDetails } from "@/modules/auth/store/user.store";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { ROUTES } from "@/configs/navigation/navigation.constants";
import { CURRENCIES } from "@/modules/auth/types/user.types";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { fbStore } from "@/configs/firebase/firebase.config";
import { fbNodes } from "@/configs/firebase/firebase.nodes";
import { toast } from "sonner";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const userDetails = useUserDetails();
  const authUser = useAuthUser();

  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("");

  useEffect(() => {
    if (userDetails) {
      setDisplayName(userDetails.displayName);
      setPhoneNumber(userDetails.phoneNumber || "");
      setDefaultCurrency(userDetails.defaultCurrency);
    }
  }, [userDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUser || !displayName.trim()) {
      toast.error("Display name is required");
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(fbStore, fbNodes.users, authUser.uid);
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim() || null,
        defaultCurrency,
        updatedAt: serverTimestamp(),
      });

      toast.success("Profile updated successfully");
      navigate(ROUTES.PROFILE);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!userDetails) return null;

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(ROUTES.PROFILE)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">Update your account information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Your profile photo from Google account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userDetails.photoURL || ""} />
                <AvatarFallback className="text-3xl">
                  {displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm text-muted-foreground">
                Profile picture is synced with your Google account
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userDetails.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 234 567 8900"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Set your default currency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select
                value={defaultCurrency}
                onValueChange={setDefaultCurrency}
                disabled={loading}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will be the default currency for new groups you create
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(ROUTES.PROFILE)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
