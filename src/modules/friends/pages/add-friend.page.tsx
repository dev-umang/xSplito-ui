import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowLeft, UserPlus, Mail } from "lucide-react";
import { ROUTES } from "@/configs/navigation/navigation.constants";
import { useSendFriendRequest } from "../hooks/useFriendActions";

export const AddFriendPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { sendRequest } = useSendFriendRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    setLoading(true);
    const result = await sendRequest(email.trim());
    setLoading(false);

    if (result.success) {
      setEmail("");
      // Navigate back after a short delay
      setTimeout(() => {
        navigate(ROUTES.FRIENDS);
      }, 1500);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(ROUTES.FRIENDS)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserPlus className="h-8 w-8" />
            Add Friend
          </h1>
          <p className="text-muted-foreground mt-1">
            Send a friend request via email
          </p>
        </div>
      </div>

      {/* Add Friend Form */}
      <Card>
        <CardHeader>
          <CardTitle>Find Friend by Email</CardTitle>
          <CardDescription>
            Enter the email address of the person you want to add
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="friend@example.com"
                  disabled={loading}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                We'll send them a friend request on xSplito
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex-1"
              >
                {loading ? "Sending..." : "Send Friend Request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.FRIENDS)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Enter the email address of someone already on xSplito
          </p>
          <p>
            • They'll receive a friend request notification
          </p>
          <p>
            • Once they accept, you can add them to groups and split expenses
          </p>
          <p className="pt-2 text-xs">
            <strong>Note:</strong> If they're not on xSplito yet, they'll need to sign up first.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddFriendPage;
