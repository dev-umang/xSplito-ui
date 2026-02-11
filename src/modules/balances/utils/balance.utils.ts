import type { Expense } from "@/modules/expenses/types/expenses.types";
import type { UserBalance, DebtEdge, GroupBalances } from "../types/balances.types";

/**
 * Calculate individual user balances from expenses
 */
export const calculateUserBalances = (
  expenses: Expense[],
  groupMembers: { userId: string; name: string; email: string; photoURL?: string }[]
): UserBalance[] => {
  const balances: Record<string, UserBalance> = {};

  // Initialize balances for all members
  groupMembers.forEach((member) => {
    balances[member.userId] = {
      userId: member.userId,
      userName: member.name,
      userEmail: member.email,
      userPhoto: member.photoURL,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: 0,
    };
  });

  // Calculate from expenses
  expenses.forEach((expense) => {
    // Add to payer's totalPaid
    if (balances[expense.paidBy.userId]) {
      balances[expense.paidBy.userId].totalPaid += expense.amount;
    }

    // Add to each participant's totalOwed
    expense.participants.forEach((participant) => {
      if (balances[participant.userId]) {
        balances[participant.userId].totalOwed += participant.amount;
      }
    });
  });

  // Calculate net balances
  Object.values(balances).forEach((balance) => {
    balance.netBalance = balance.totalPaid - balance.totalOwed;
  });

  return Object.values(balances);
};

/**
 * Simplify debts using a greedy algorithm
 * Minimizes the number of transactions needed to settle all debts
 */
export const simplifyDebts = (userBalances: UserBalance[]): DebtEdge[] => {
  const debts: DebtEdge[] = [];
  
  // Create lists of creditors (owed money) and debtors (owe money)
  const creditors = userBalances
    .filter((b) => b.netBalance > 0.01)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.netBalance - a.netBalance);
    
  const debtors = userBalances
    .filter((b) => b.netBalance < -0.01)
    .map((b) => ({ ...b, netBalance: Math.abs(b.netBalance) }))
    .sort((a, b) => b.netBalance - a.netBalance);

  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amount = Math.min(creditor.netBalance, debtor.netBalance);

    if (amount > 0.01) {
      debts.push({
        fromUserId: debtor.userId,
        fromUserName: debtor.userName,
        toUserId: creditor.userId,
        toUserName: creditor.userName,
        amount,
      });
    }

    creditor.netBalance -= amount;
    debtor.netBalance -= amount;

    if (creditor.netBalance < 0.01) i++;
    if (debtor.netBalance < 0.01) j++;
  }

  return debts;
};

/**
 * Calculate complete group balances including simplified debts
 */
export const calculateGroupBalances = (
  groupId: string,
  expenses: Expense[],
  groupMembers: { userId: string; name: string; email: string; photoURL?: string }[]
): GroupBalances => {
  const userBalances = calculateUserBalances(expenses, groupMembers);
  const simplifiedDebts = simplifyDebts(userBalances);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    groupId,
    userBalances,
    simplifiedDebts,
    totalExpenses,
    lastCalculated: new Date(),
  };
};

/**
 * Get balance for specific user in a group
 */
export const getUserBalance = (
  userId: string,
  userBalances: UserBalance[]
): UserBalance | null => {
  return userBalances.find((b) => b.userId === userId) || null;
};

/**
 * Get debts involving specific user
 */
export const getUserDebts = (
  userId: string,
  debts: DebtEdge[]
): { owes: DebtEdge[]; owed: DebtEdge[] } => {
  return {
    owes: debts.filter((d) => d.fromUserId === userId),
    owed: debts.filter((d) => d.toUserId === userId),
  };
};
