import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Home, FolderOpen, Plus, Users, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/configs/navigation/navigation.constants";
import { useReceivedRequests } from "@/modules/friends/store/friends.store";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGroups } from "@/modules/groups/store/groups.store";
import { useAddExpense } from "@/modules/expenses/hooks/useExpenseActions";
import { getGroupDetailRoute } from "@/configs/navigation/navigation.constants";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const friendRequests = useReceivedRequests();
  const authUser = useAuthUser();
  const groups = useGroups();
  const { addExpense } = useAddExpense();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || !amount || !selectedGroupId || !authUser) {
      toast.error("Please fill in all fields");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const selectedGroup = groups.find((g) => g.id === selectedGroupId);
    if (!selectedGroup) {
      toast.error("Selected group not found");
      return;
    }

    setLoading(true);

    const result = await addExpense({
      groupId: selectedGroupId,
      description: description.trim(),
      amount: amountNum,
      category: "other",
      paidById: authUser.uid,
      splitType: "equal",
      participantIds: selectedGroup.members.map((m) => m.userId),
      date: new Date(),
      notes: "Quick expense",
    });

    setLoading(false);

    if (result.success) {
      setOpen(false);
      setDescription("");
      setAmount("");
      navigate(getGroupDetailRoute(selectedGroupId));
    }
  };

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
      key: "add",
      label: "Add",
      icon: Plus,
      path: null,
      badge: 0,
      action: () => setOpen(true),
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

  const isActive = (path: string | null) => {
    if (!path) return false;
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            const isPlusButton = tab.key === "add";

            return (
              <button
                key={tab.key}
                onClick={() => tab.action ? tab.action() : tab.path && navigate(tab.path)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative",
                  isPlusButton
                    ? "text-primary"
                    : active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "relative",
                  isPlusButton && "bg-primary text-primary-foreground rounded-full p-2"
                )}>
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

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>Quick Expense</SheetTitle>
            <SheetDescription>
              Add a new expense quickly (split equally among all members)
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4 p-default">
            <div className="space-y-2">
              <Label htmlFor="group">Group</Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger id="group">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Lunch at restaurant"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Expense
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BottomNav;
