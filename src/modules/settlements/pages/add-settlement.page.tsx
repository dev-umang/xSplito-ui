import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useGroup } from "@/modules/groups/store/groups.store";
import { useAddSettlement } from "../hooks/useSettlementActions";
import { useGroupSettlements } from "../store/settlements.store";
import { ROUTES, getGroupDetailRoute } from "@/configs/navigation/navigation.constants";
import SettlementList from "../components/settlement-list";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { useGroupBalances } from "@/modules/balances/store/balances.store";
import { getUserDebts } from "@/modules/balances/utils/balance.utils";

const AddSettlementPage = () => {
  const navigate = useNavigate();
  const { id: groupId } = useParams<{ id: string }>();
  const authUser = useAuthUser();
  const group = useGroup(groupId || "");
  const { addSettlement, loading } = useAddSettlement();
  const settlements = useGroupSettlements(groupId);
  const groupBalances = useGroupBalances(groupId || "");

  const [fromUserId, setFromUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const simplifiedDebts = useMemo(() => {
    return groupBalances?.simplifiedDebts || [];
  }, [groupBalances]);

  const userDebts = useMemo(() => {
    if (!authUser) return { owes: [], owed: [] };
    return getUserDebts(authUser.uid, simplifiedDebts);
  }, [authUser, simplifiedDebts]);

  useEffect(() => {
    if (!groupId || !group) {
      navigate(ROUTES.GROUPS);
    }
  }, [groupId, group, navigate]);

  if (!group) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    if (!fromUserId || !toUserId || fromUserId === toUserId) {
      return;
    }

    const result = await addSettlement({
      groupId: group.id,
      fromUserId,
      toUserId,
      amount: amountNum,
      date: new Date(),
      notes,
    });

    if (result.success) {
      navigate(getGroupDetailRoute(group.id) + "?tab=settlements");
    }
  };

  const handleQuickSettle = (debt: { fromUserId: string; toUserId: string; amount: number }) => {
    setFromUserId(debt.fromUserId);
    setToUserId(debt.toUserId);
    setAmount(debt.amount.toFixed(2));
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(getGroupDetailRoute(group.id))}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Record Settlement</h1>
          <p className="text-muted-foreground">{group.name}</p>
        </div>
      </div>

      {/* Quick Settle Section */}
      {simplifiedDebts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Settlements</CardTitle>
            <CardDescription>
              Quick actions to settle debts in this group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Your Debts */}
            {userDebts.owes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  You Owe
                </h4>
                <div className="space-y-2">
                  {userDebts.owes.map((debt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              group.members.find(m => m.userId === debt.toUserId)
                                ?.photoURL || ""
                            }
                          />
                          <AvatarFallback className="text-xs">
                            {debt.toUserName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{debt.toUserName}</p>
                          <p className="text-xs text-muted-foreground">
                            {group.currency} {debt.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleQuickSettle({
                            fromUserId: debt.fromUserId,
                            toUserId: debt.toUserId,
                            amount: debt.amount,
                          })
                        }
                      >
                        Settle
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Others Owe You */}
            {userDebts.owed.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Others Owe You
                </h4>
                <div className="space-y-2">
                  {userDebts.owed.map((debt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              group.members.find(m => m.userId === debt.fromUserId)
                                ?.photoURL || ""
                            }
                          />
                          <AvatarFallback className="text-xs">
                            {debt.fromUserName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{debt.fromUserName}</p>
                          <p className="text-xs text-muted-foreground">
                            {group.currency} {debt.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleQuickSettle({
                            fromUserId: debt.fromUserId,
                            toUserId: debt.toUserId,
                            amount: debt.amount,
                          })
                        }
                      >
                        Record
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settlement Form */}
      <Card>
        <CardHeader>
          <CardTitle>Record Payment</CardTitle>
          <CardDescription>
            Record a payment between members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from">From (Payer)</Label>
              <Select value={fromUserId} onValueChange={setFromUserId}>
                <SelectTrigger id="from">
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {group.members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.photoURL || ""} />
                          <AvatarFallback className="text-xs">
                            {member.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To (Receiver)</Label>
              <Select value={toUserId} onValueChange={setToUserId}>
                <SelectTrigger id="to">
                  <SelectValue placeholder="Select who received" />
                </SelectTrigger>
                <SelectContent>
                  {group.members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.photoURL || ""} />
                          <AvatarFallback className="text-xs">
                            {member.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({group.currency})</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this payment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(getGroupDetailRoute(group.id))}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Payment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Settlements */}
      {settlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Settlements</CardTitle>
            <CardDescription>
              Latest payment records in this group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettlementList settlements={settlements.slice(0, 5)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddSettlementPage;
