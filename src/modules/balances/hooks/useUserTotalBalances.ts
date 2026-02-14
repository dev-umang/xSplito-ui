import { useMemo } from "react";
import { useGroups } from "@/modules/groups/store/groups.store";
import { useExpensesStore } from "@/modules/expenses/store/expenses.store";
import { useSettlementsStore } from "@/modules/settlements/store/settlements.store";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { calculateGroupBalances, getUserDebts } from "@/modules/balances/utils/balance.utils";

export type UserTotalBalance = {
  totalOwed: number; // Total amount you owe
  totalOwing: number; // Total amount owed to you
  netBalance: number; // Net balance (positive = owed to you, negative = you owe)
  debts: Array<{
    groupId: string;
    groupName: string;
    toUserId: string;
    toUserName: string;
    toUserPhoto?: string;
    amount: number;
  }>;
  credits: Array<{
    groupId: string;
    groupName: string;
    fromUserId: string;
    fromUserName: string;
    fromUserPhoto?: string;
    amount: number;
  }>;
};

export const useUserTotalBalances = (): UserTotalBalance | null => {
  const authUser = useAuthUser();
  const groups = useGroups();
  const expensesStore = useExpensesStore();
  const settlementsStore = useSettlementsStore();

  return useMemo(() => {
    if (!authUser) return null;

    let totalOwed = 0;
    let totalOwing = 0;
    const debts: UserTotalBalance["debts"] = [];
    const credits: UserTotalBalance["credits"] = [];

    groups.forEach((group) => {
      const expenses = expensesStore.groupExpenses[group.id] || [];
      const settlements = settlementsStore.settlements.filter(s => s.groupId === group.id);
      
      if (expenses.length === 0 && settlements.length === 0) return;

      const balances = calculateGroupBalances(
        group.id,
        expenses,
        settlements,
        group.members.map((m) => ({
          userId: m.userId,
          name: m.name,
          email: m.email,
          photoURL: m.photoURL || undefined,
        }))
      );

      const userDebts = getUserDebts(authUser.uid, balances.simplifiedDebts);

      // Process debts (what I owe)
      userDebts.owes.forEach((debt) => {
        totalOwed += debt.amount;
        const toUserMember = group.members.find(m => m.userId === debt.toUserId);
        debts.push({
          groupId: group.id,
          groupName: group.name,
          toUserId: debt.toUserId,
          toUserName: debt.toUserName,
          toUserPhoto: toUserMember?.photoURL || undefined,
          amount: debt.amount,
        });
      });

      // Process credits (what others owe me)
      userDebts.owed.forEach((credit) => {
        totalOwing += credit.amount;
        const fromUserMember = group.members.find(m => m.userId === credit.fromUserId);
        credits.push({
          groupId: group.id,
          groupName: group.name,
          fromUserId: credit.fromUserId,
          fromUserName: credit.fromUserName,
          fromUserPhoto: fromUserMember?.photoURL || undefined,
          amount: credit.amount,
        });
      });
    });

    return {
      totalOwed,
      totalOwing,
      netBalance: totalOwing - totalOwed,
      debts,
      credits,
    };
  }, [authUser, groups, expensesStore.groupExpenses, settlementsStore.settlements]);
};
