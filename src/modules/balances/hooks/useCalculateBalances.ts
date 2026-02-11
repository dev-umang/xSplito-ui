import { useEffect, useRef } from "react";
import { useGroupExpenses } from "@/modules/expenses/store/expenses.store";
import { useBalancesActions } from "../store/balances.store";
import { calculateGroupBalances } from "../utils/balance.utils";
import type { Group } from "@/modules/groups/types/groups.types";

export const useCalculateBalances = (group: Group | null) => {
  const groupId = group?.id;
  const expenses = useGroupExpenses(groupId || "");
  const { setGroupBalances } = useBalancesActions();

  // Use ref to store group and expenses to compare
  const dataRef = useRef<{
    groupId: string;
    memberIds: string[];
    expenseData: string[];
  } | null>(null);

  useEffect(() => {
    if (!group || !groupId) return;
    debugger;
    // Create current state snapshot
    const memberIds = group.members.map((m) => m.userId).sort();
    const expenseData = expenses
      .map((e) => `${e.id}:${e.amount}:${e.updatedAt}`)
      .sort();

    // Compare with previous state
    const prev = dataRef.current;
    const changed =
      !prev ||
      prev.groupId !== groupId ||
      JSON.stringify(prev.memberIds) !== JSON.stringify(memberIds) ||
      JSON.stringify(prev.expenseData) !== JSON.stringify(expenseData);

    if (!changed) return;

    // Store current state
    dataRef.current = { groupId, memberIds, expenseData };

    // Calculate balances
    const balances = calculateGroupBalances(
      groupId,
      expenses,
      group.members.map((m) => ({
        userId: m.userId,
        name: m.name,
        email: m.email,
        photoURL: m.photoURL,
      })),
    );

    setGroupBalances(groupId, balances);
  }, [groupId, group?.members, expenses, group, setGroupBalances]);
};
