import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plus,
  Users,
  Receipt,
  TrendingUp,
  Settings,
  Crown,
  UserPlus,
} from "lucide-react";
import {
  ROUTES,
  getAddExpenseRoute,
} from "@/configs/navigation/navigation.constants";
import { useListenGroupDetails } from "../hooks/useListenGroups";
import { useSelectedGroup, useGroupsLoading } from "../store/groups.store";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { useListenGroupExpenses } from "@/modules/expenses/hooks/useListenExpenses";
import { useGroupExpenses } from "@/modules/expenses/store/expenses.store";
import { EXPENSE_CATEGORIES } from "@/modules/expenses/types/expenses.types";
import { useCalculateBalances } from "@/modules/balances/hooks/useCalculateBalances";
import { useGroupBalances } from "@/modules/balances/store/balances.store";
import { getUserDebts } from "@/modules/balances/utils/balance.utils";

export const GroupDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authUser = useAuthUser();

  useListenGroupDetails(id); // Start listening to group details
  useListenGroupExpenses(id); // Start listening to expenses

  const group = useSelectedGroup();
  const loading = useGroupsLoading();
  const expenses = useGroupExpenses(id || "");

  // Calculate balances
  useCalculateBalances(group);
  const balances = useGroupBalances(id || "");

  const isAdmin =
    group?.members.find((m) => m.userId === authUser?.uid)?.role === "admin";

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

  if (loading || !group) {
    return (
      <div className="container max-w-5xl mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(ROUTES.GROUPS)}
          className="mt-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{group.name}</h1>
              {group.description && (
                <p className="text-muted-foreground mt-1">
                  {group.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">
                  {getCurrencySymbol(group.currency)} {group.currency}
                </Badge>
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {group.members.length} members
                </Badge>
              </div>
            </div>
            {isAdmin && (
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => navigate(getAddExpenseRoute(group.id))}
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
        <Button variant="outline" className="flex-1">
          <TrendingUp className="h-4 w-4 mr-2" />
          Settle Up
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenses">
            <Receipt className="h-4 w-4 mr-2" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="balances">
            <TrendingUp className="h-4 w-4 mr-2" />
            Balances
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
        </TabsList>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No expenses yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start by adding your first expense to this group
                  </p>
                  <Button
                    onClick={() => navigate(getAddExpenseRoute(group.id))}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => {
                    const category = EXPENSE_CATEGORIES.find(
                      (c) => c.value === expense.category,
                    );
                    return (
                      <div
                        key={expense.id}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">
                                {category?.icon || "📌"}
                              </span>
                              <h4 className="font-semibold">
                                {expense.description}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Paid by {expense.paidBy.userName}</span>
                              <span>•</span>
                              <span>{expense.date.toLocaleDateString()}</span>
                            </div>
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">
                                Split:{" "}
                              </span>
                              {expense.splitType === "equal" && "Split equally"}
                              {expense.splitType === "exact" && "Exact amounts"}
                              {expense.splitType === "percentage" &&
                                "By percentage"}
                              <span className="text-muted-foreground">
                                {" "}
                                • {expense.participants.length} people
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">
                              {getCurrencySymbol(expense.currency)}
                              {expense.amount.toFixed(2)}
                            </div>
                            <Badge variant="outline" className="mt-1">
                              {category?.label || "Other"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balances Tab */}
        <TabsContent value="balances" className="space-y-4">
          {!balances || balances.simplifiedDebts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Group Balances</CardTitle>
                <CardDescription>
                  See who owes whom in this group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  {expenses.length === 0
                    ? "No expenses yet - add expenses to see balances"
                    : "All settled up! 🎉"}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Your Balance Summary */}
              {authUser &&
                (() => {
                  const myBalance = balances.userBalances.find(
                    (b) => b.userId === authUser.uid,
                  );
                  const myDebts = getUserDebts(
                    authUser.uid,
                    balances.simplifiedDebts,
                  );

                  if (!myBalance) return null;

                  return (
                    <Card
                      className={
                        myBalance.netBalance > 0
                          ? "border-green-500"
                          : myBalance.netBalance < 0
                            ? "border-orange-500"
                            : ""
                      }
                    >
                      <CardHeader>
                        <CardTitle>Your Balance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-center p-6 bg-muted rounded-lg">
                            <div className="text-4xl font-bold mb-2">
                              {myBalance.netBalance >= 0 ? "+" : ""}
                              {getCurrencySymbol(group.currency)}
                              {Math.abs(myBalance.netBalance).toFixed(2)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {myBalance.netBalance > 0 && "You are owed"}
                              {myBalance.netBalance < 0 && "You owe"}
                              {myBalance.netBalance === 0 &&
                                "You're settled up"}
                            </p>
                          </div>

                          {myDebts.owes.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-orange-600">
                                You owe:
                              </h4>
                              <div className="space-y-2">
                                {myDebts.owes.map((debt, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                  >
                                    <span>{debt.toUserName}</span>
                                    <span className="font-semibold text-orange-600">
                                      {getCurrencySymbol(group.currency)}
                                      {debt.amount.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {myDebts.owed.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-green-600">
                                Owes you:
                              </h4>
                              <div className="space-y-2">
                                {myDebts.owed.map((debt, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                  >
                                    <span>{debt.fromUserName}</span>
                                    <span className="font-semibold text-green-600">
                                      {getCurrencySymbol(group.currency)}
                                      {debt.amount.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

              {/* All Debts */}
              <Card>
                <CardHeader>
                  <CardTitle>Simplified Balances</CardTitle>
                  <CardDescription>
                    Minimized list of transactions to settle all debts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {balances.simplifiedDebts.map((debt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {debt.fromUserName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{debt.fromUserName}</p>
                          <p className="text-sm text-muted-foreground">owes</p>
                        </div>
                        <div className="text-xl font-bold text-orange-600">
                          {getCurrencySymbol(group.currency)}
                          {debt.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">to</div>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {debt.toUserName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{debt.toUserName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Individual Balances */}
              <Card>
                <CardHeader>
                  <CardTitle>Individual Balances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {balances.userBalances
                      .sort((a, b) => b.netBalance - a.netBalance)
                      .map((balance) => (
                        <div
                          key={balance.userId}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={balance.userPhoto} />
                              <AvatarFallback>
                                {balance.userName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{balance.userName}</p>
                              <p className="text-xs text-muted-foreground">
                                Paid {getCurrencySymbol(group.currency)}
                                {balance.totalPaid.toFixed(2)} • Owes{" "}
                                {getCurrencySymbol(group.currency)}
                                {balance.totalOwed.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`text-lg font-bold ${balance.netBalance > 0 ? "text-green-600" : balance.netBalance < 0 ? "text-orange-600" : "text-muted-foreground"}`}
                          >
                            {balance.netBalance >= 0 ? "+" : ""}
                            {getCurrencySymbol(group.currency)}
                            {balance.netBalance.toFixed(2)}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Members</CardTitle>
                  <CardDescription>
                    {group.members.length} people in this group
                  </CardDescription>
                </div>
                {isAdmin && (
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.photoURL || ""} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {member.name}
                          {member.role === "admin" && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    {member.role === "admin" ? (
                      <Badge variant="secondary">Admin</Badge>
                    ) : (
                      isAdmin &&
                      member.userId !== authUser?.uid && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                        >
                          Remove
                        </Button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupDetailPage;
