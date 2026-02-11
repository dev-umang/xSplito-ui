import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { useGroups } from "@/modules/groups/store/groups.store";
import { useAddExpense } from "@/modules/expenses/hooks/useExpenseActions";
import { getGroupDetailRoute } from "@/configs/navigation/navigation.constants";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { toast } from "sonner";

const QuickExpenseFAB = () => {
  const navigate = useNavigate();
  const authUser = useAuthUser();
  const groups = useGroups();
  const { addExpense } = useAddExpense();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  // Auto-select most recent group when sheet opens
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

  // Don't show FAB if user has no groups
  if (groups.length === 0) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg lg:bottom-6 z-50"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
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
  );
};

export default QuickExpenseFAB;
