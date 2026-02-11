import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { getGroupDetailRoute } from "@/configs/navigation/navigation.constants";
import { useSelectedGroup } from "@/modules/groups/store/groups.store";
import { useListenGroupDetails } from "@/modules/groups/hooks/useListenGroups";
import { useAddExpense } from "../hooks/useExpenseActions";
import { EXPENSE_CATEGORIES, type SplitType } from "../types/expenses.types";
import { useAuthUser } from "@/modules/auth/store/auth.store";

export const AddExpensePage = () => {
  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authUser = useAuthUser();

  useListenGroupDetails(groupId);
  const group = useSelectedGroup();
  const { addExpense } = useAddExpense();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "other",
    paidById: authUser?.uid || "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [exactSplits, setExactSplits] = useState<Record<string, string>>({});
  const [percentageSplits, setPercentageSplits] = useState<Record<string, string>>({});

  // Auto-select all members and current user as payer
  useEffect(() => {
    if (group && authUser) {
      const memberIds = group.members.map((m) => m.userId);
      setSelectedParticipants(memberIds);
      setFormData((prev) => ({ ...prev, paidById: authUser.uid }));
    }
  }, [group, authUser]);

  const handleParticipantToggle = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$", EUR: "€", GBP: "£", INR: "₹",
      JPY: "¥", AUD: "A$", CAD: "C$", CNY: "¥",
    };
    return symbols[currency] || currency;
  };

  const validateForm = () => {
    const amount = parseFloat(formData.amount);
    
    if (!formData.description.trim()) {
      alert("Please enter a description");
      return false;
    }
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return false;
    }
    if (selectedParticipants.length === 0) {
      alert("Please select at least one participant");
      return false;
    }
    if (!formData.paidById) {
      alert("Please select who paid");
      return false;
    }

    // Validate exact splits
    if (splitType === "exact") {
      const total = selectedParticipants.reduce((sum, userId) => {
        return sum + (parseFloat(exactSplits[userId]) || 0);
      }, 0);
      if (Math.abs(total - amount) > 0.01) {
        alert(`Split amounts (${total}) don't match total (${amount})`);
        return false;
      }
    }

    // Validate percentage splits
    if (splitType === "percentage") {
      const total = selectedParticipants.reduce((sum, userId) => {
        return sum + (parseFloat(percentageSplits[userId]) || 0);
      }, 0);
      if (Math.abs(total - 100) > 0.1) {
        alert(`Percentages must add up to 100% (currently ${total}%)`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupId || !group || !validateForm()) {
      return;
    }

    const amount = parseFloat(formData.amount);
    const expenseInput = {
      groupId,
      description: formData.description,
      amount,
      category: formData.category,
      paidById: formData.paidById,
      splitType,
      date: new Date(formData.date),
      notes: formData.notes,
    };

    if (splitType === "equal") {
      expenseInput.participantIds = selectedParticipants;
    } else if (splitType === "exact") {
      expenseInput.exactSplits = selectedParticipants.map((userId) => ({
        userId,
        amount: parseFloat(exactSplits[userId]) || 0,
      }));
    } else if (splitType === "percentage") {
      expenseInput.percentageSplits = selectedParticipants.map((userId) => ({
        userId,
        percentage: parseFloat(percentageSplits[userId]) || 0,
      }));
    }

    setLoading(true);
    const result = await addExpense(expenseInput);
    setLoading(false);

    if (result.success) {
      navigate(getGroupDetailRoute(groupId));
    }
  };

  if (!group) {
    return <div className="container p-4">Loading...</div>;
  }

  const equalShare = selectedParticipants.length > 0
    ? (parseFloat(formData.amount) || 0) / selectedParticipants.length
    : 0;

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(getGroupDetailRoute(groupId!))}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Expense</h1>
          <p className="text-muted-foreground mt-1">{group.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="e.g., Dinner at restaurant"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">
                    {getCurrencySymbol(group.currency)}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    placeholder="0.00"
                    disabled={loading}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paidBy">Paid by *</Label>
                <Select
                  value={formData.paidById}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, paidById: value }))
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {group.members.map((member) => (
                      <SelectItem key={member.userId} value={member.userId}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Add any additional notes..."
                disabled={loading}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Split Between</CardTitle>
            <CardDescription>Select how to divide this expense</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={splitType} onValueChange={(v) => setSplitType(v as SplitType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="equal">Equal</TabsTrigger>
                <TabsTrigger value="exact">Exact</TabsTrigger>
                <TabsTrigger value="percentage">%</TabsTrigger>
              </TabsList>

              <TabsContent value="equal" className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  Split equally: {getCurrencySymbol(group.currency)}
                  {equalShare.toFixed(2)} per person
                </p>
                {group.members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3 p-2 border rounded">
                    <Checkbox
                      checked={selectedParticipants.includes(member.userId)}
                      onCheckedChange={() => handleParticipantToggle(member.userId)}
                      disabled={loading}
                    />
                    <span className="flex-1">{member.name}</span>
                    {selectedParticipants.includes(member.userId) && (
                      <span className="text-sm text-muted-foreground">
                        {getCurrencySymbol(group.currency)}{equalShare.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="exact" className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  Enter exact amount for each person
                </p>
                {group.members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedParticipants.includes(member.userId)}
                      onCheckedChange={() => handleParticipantToggle(member.userId)}
                      disabled={loading}
                    />
                    <span className="flex-1">{member.name}</span>
                    {selectedParticipants.includes(member.userId) && (
                      <Input
                        type="number"
                        step="0.01"
                        value={exactSplits[member.userId] || ""}
                        onChange={(e) =>
                          setExactSplits((prev) => ({
                            ...prev,
                            [member.userId]: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="w-24"
                        disabled={loading}
                      />
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="percentage" className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  Enter percentage for each person (must total 100%)
                </p>
                {group.members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedParticipants.includes(member.userId)}
                      onCheckedChange={() => handleParticipantToggle(member.userId)}
                      disabled={loading}
                    />
                    <span className="flex-1">{member.name}</span>
                    {selectedParticipants.includes(member.userId) && (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.1"
                          value={percentageSplits[member.userId] || ""}
                          onChange={(e) =>
                            setPercentageSplits((prev) => ({
                              ...prev,
                              [member.userId]: e.target.value,
                            }))
                          }
                          placeholder="0"
                          className="w-20"
                          disabled={loading}
                        />
                        <span>%</span>
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Adding..." : "Add Expense"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(getGroupDetailRoute(groupId!))}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddExpensePage;
