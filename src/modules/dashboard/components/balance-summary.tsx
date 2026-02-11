import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useUserTotalBalances } from "@/modules/balances/hooks/useUserTotalBalances";
import { useUserDetails } from "@/modules/auth/store/user.store";
import { getGroupDetailRoute } from "@/configs/navigation/navigation.constants";

const BalanceSummary = () => {
  const balances = useUserTotalBalances();
  const userDetails = useUserDetails();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!balances || !userDetails) return null;

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

  const currencySymbol = getCurrencySymbol(userDetails.defaultCurrency);

  // Don't show if no debts or credits
  if (balances.debts.length === 0 && balances.credits.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* You Owe Card */}
        <Card className={balances.totalOwed > 0 ? "border-orange-500" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              You Owe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {currencySymbol}
              {balances.totalOwed.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {balances.debts.length === 0
                ? "All settled"
                : `${balances.debts.length} ${balances.debts.length === 1 ? "debt" : "debts"}`}
            </p>
          </CardContent>
        </Card>

        {/* You're Owed Card */}
        <Card className={balances.totalOwing > 0 ? "border-green-500" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              You're Owed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currencySymbol}
              {balances.totalOwing.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {balances.credits.length === 0
                ? "No credits"
                : `${balances.credits.length} ${balances.credits.length === 1 ? "credit" : "credits"}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expandable Details */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto">
              <span className="font-medium">
                {isOpen ? "Hide" : "Show"} Balance Details
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* Debts Section */}
              {balances.debts.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-orange-600 mb-2">
                    You Owe:
                  </h4>
                  <div className="space-y-2">
                    {balances.debts.map((debt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => navigate(getGroupDetailRoute(debt.groupId))}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={debt.toUserPhoto || ""} />
                            <AvatarFallback>
                              {debt.toUserName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {debt.toUserName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              in {debt.groupName}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-orange-600">
                          {currencySymbol}
                          {debt.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Credits Section */}
              {balances.credits.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-green-600 mb-2">
                    Owes You:
                  </h4>
                  <div className="space-y-2">
                    {balances.credits.map((credit, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => navigate(getGroupDetailRoute(credit.groupId))}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={credit.fromUserPhoto || ""} />
                            <AvatarFallback>
                              {credit.fromUserName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {credit.fromUserName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              in {credit.groupName}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          {currencySymbol}
                          {credit.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default BalanceSummary;
