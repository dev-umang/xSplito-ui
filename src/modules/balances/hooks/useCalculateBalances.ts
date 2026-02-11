import { useEffect, useRef } from "react";
import { useGroupExpenses } from "@/modules/expenses/store/expenses.store";
import { useBalancesStore } from "../store/balances.store";
import { calculateGroupBalances } from "../utils/balance.utils";
import type { Group } from "@/modules/groups/types/groups.types";

export const useCalculateBalances = (group: Group | null) => {
  const groupId = group?.id;
  const expenses = useGroupExpenses(groupId || "");
  const actionsRef = useRef(useBalancesStore.getState().actions);

  // Use ref to store group and expenses to compare
  const dataRef = useRef<{
    groupId: string;
    memberIds: string[];
    expenseData: string[];
  } | null>(null);

  const renderCountRef = useRef(0);
  renderCountRef.current++;

  useEffect(() => {
    console.log(`[useCalculateBalances] Effect triggered #${renderCountRef.current}`, {
      hasGroup: !!group,
      groupId,
      memberCount: group?.members.length,
      expenseCount: expenses.length,
    });

    if (!group || !groupId) {
      console.log(`[useCalculateBalances] Skipping - no group or groupId`);
      return;
    }

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

    if (!changed) {
      console.log(`[useCalculateBalances] No changes detected - skipping calculation`);
      return;
    }

    console.log(`[useCalculateBalances] Changes detected, recalculating...`, {
      prevGroupId: prev?.groupId,
      newGroupId: groupId,
      prevMemberCount: prev?.memberIds.length,
      newMemberCount: memberIds.length,
      prevExpenseCount: prev?.expenseData.length,
      newExpenseCount: expenseData.length,
    });

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
        photoURL: m.photoURL || undefined,
      })),
    );

    console.log(`[useCalculateBalances] Balances calculated:`, {
      userBalancesCount: balances.userBalances.length,
      simplifiedDebtsCount: balances.simplifiedDebts.length,
    });

    actionsRef.current.setGroupBalances(groupId, balances);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, expenses]);
  // Note: 'group' object is compared internally via groupId and member changes
};
