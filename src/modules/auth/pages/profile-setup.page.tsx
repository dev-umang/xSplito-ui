import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDoc, serverTimestamp } from "firebase/firestore";
import { fbRefs } from "@/configs/firebase/firebase.nodes";
import { ROUTES } from "@/configs/navigation/navigation.constants";
import { useAuthUser } from "../store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CURRENCIES } from "../types/user.types";
import { toast } from "sonner";

export const ProfileSetupPage = () => {
  const authUser = useAuthUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: authUser?.displayName || "",
    phoneNumber: authUser?.phoneNumber || "",
    defaultCurrency: "USD",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Name is required";
    }

    if (!formData.defaultCurrency) {
      newErrors.defaultCurrency = "Please select a currency";
    }

    if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUser?.uid) {
      toast.error("Authentication error. Please login again.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userRef = fbRefs.users(authUser.uid);
      await setDoc(userRef, {
        uid: authUser.uid,
        email: authUser.email,
        displayName: formData.displayName.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
        photoURL: authUser.photoURL || null,
        defaultCurrency: formData.defaultCurrency,
        profileCompleted: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Profile setup complete!");
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us a bit about yourself to get started with xSplito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                placeholder="Enter your full name"
                disabled={loading}
                className={errors.displayName ? "border-red-500" : ""}
              />
              {errors.displayName && (
                <p className="text-sm text-red-500">{errors.displayName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                placeholder="+1 234 567 8900"
                disabled={loading}
                className={errors.phoneNumber ? "border-red-500" : ""}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Default Currency */}
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">
                Default Currency <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.defaultCurrency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, defaultCurrency: value }))
                }
                disabled={loading}
              >
                <SelectTrigger
                  className={errors.defaultCurrency ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.defaultCurrency && (
                <p className="text-sm text-red-500">
                  {errors.defaultCurrency}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              size="lg"
            >
              {loading ? "Setting up..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetupPage;
