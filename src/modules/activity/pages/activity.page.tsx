import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Users, FolderOpen, Clock } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useListenGroups } from "@/modules/groups/hooks/useListenGroups";
import { useGroups } from "@/modules/groups/store/groups.store";
import { useExpensesStore } from "@/modules/expenses/store/expenses.store";
import { EXPENSE_CATEGORIES } from "@/modules/expenses/types/expenses.types";
import { getGroupDetailRoute } from "@/configs/navigation/navigation.constants";
import type { Expense } from "@/modules/expenses/types/expenses.types";

const ActivityPage = () => {
  const navigate = useNavigate();
  useListenGroups();
  const groups = useGroups();
  const expensesStore = useExpensesStore();

  // Aggregate all expenses from all groups and sort by date
  const allActivities = useMemo(() => {
    const expenses: Expense[] = [];
    
    groups.forEach((group) => {
      const groupExpenses = expensesStore.groupExpenses[group.id] || [];
      expenses.push(...groupExpenses);
    });

    return expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [groups, expensesStore.groupExpenses]);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

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
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Activity Feed</h1>
        <p className="text-muted-foreground">
          Recent expenses across all your groups
        </p>
      </div>

      {allActivities.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Receipt className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
              <p className="text-muted-foreground">
                Expenses from your groups will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {allActivities.map((expense) => {
            const category = EXPENSE_CATEGORIES.find(
              (c) => c.value === expense.category
            );
            
            return (
              <Card
                key={expense.id}
                className="hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(getGroupDetailRoute(expense.groupId))}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">{category?.icon || "📌"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">
                            {expense.description}
                          </h4>
                          <Badge variant="outline" className="shrink-0">
                            {category?.label || "Other"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={expense.paidBy.userPhoto || ""} />
                            <AvatarFallback className="text-[10px]">
                              {expense.paidBy.userName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{expense.paidBy.userName} paid</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{formatRelativeTime(expense.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {expense.groupName}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {expense.participants.length} people
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold">
                        {getCurrencySymbol(expense.currency)}
                        {expense.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {expense.splitType} split
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
