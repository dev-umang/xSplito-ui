import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X } from "lucide-react";
import { ROUTES, getGroupDetailRoute } from "@/configs/navigation/navigation.constants";
import { useCreateGroup } from "../hooks/useGroupActions";
import { CURRENCIES } from "@/modules/auth/types/user.types";
import { useUserDetails } from "@/modules/auth/store/user.store";

export const CreateGroupPage = () => {
  const navigate = useNavigate();
  const userDetails = useUserDetails();
  const { createGroup } = useCreateGroup();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    currency: userDetails?.defaultCurrency || "USD",
  });
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ ...errors, email: "Please enter a valid email address" });
      return;
    }

    if (email === userDetails?.email.toLowerCase()) {
      setErrors({ ...errors, email: "You'll be added automatically" });
      return;
    }

    if (memberEmails.includes(email)) {
      setErrors({ ...errors, email: "Email already added" });
      return;
    }

    setMemberEmails([...memberEmails, email]);
    setEmailInput("");
    setErrors({ ...errors, email: "" });
  };

  const handleRemoveEmail = (email: string) => {
    setMemberEmails(memberEmails.filter((e) => e !== email));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    }

    if (!formData.currency) {
      newErrors.currency = "Please select a currency";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result = await createGroup({
      name: formData.name,
      description: formData.description || undefined,
      currency: formData.currency,
      memberEmails,
    });
    setLoading(false);

    if (result.success && result.groupId) {
      navigate(getGroupDetailRoute(result.groupId), { replace: true });
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(ROUTES.GROUPS)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Group</h1>
          <p className="text-muted-foreground mt-1">
            Set up a new group to split expenses
          </p>
        </div>
      </div>

      {/* Create Group Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
            <CardDescription>
              Basic information about your group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Group Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Weekend Trip, Apartment Rent"
                disabled={loading}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="What's this group for?"
                disabled={loading}
                rows={3}
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">
                Currency <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, currency: value }))
                }
                disabled={loading}
              >
                <SelectTrigger
                  className={errors.currency ? "border-red-500" : ""}
                >
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
              {errors.currency && (
                <p className="text-sm text-red-500">{errors.currency}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Members */}
        <Card>
          <CardHeader>
            <CardTitle>Add Members (Optional)</CardTitle>
            <CardDescription>
              Invite others by email - they must have an xSplito account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Member Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddEmail())}
                  placeholder="friend@example.com"
                  disabled={loading}
                  className={errors.email ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddEmail}
                  disabled={loading || !emailInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Member List */}
            {memberEmails.length > 0 && (
              <div className="space-y-2">
                <Label>Members to add ({memberEmails.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {memberEmails.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="pl-3 pr-1 py-1"
                    >
                      {email}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-1 hover:bg-transparent"
                        onClick={() => handleRemoveEmail(email)}
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              You'll be added as the group admin automatically
            </p>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Creating..." : "Create Group"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.GROUPS)}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroupPage;
