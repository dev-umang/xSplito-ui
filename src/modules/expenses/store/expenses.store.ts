import { create } from "zustand";
import type { Expense } from "../types/expenses.types";

type ExpensesStoreType = {
  expenses: Expense[];
  groupExpenses: Record<string, Expense[]>; // Expenses grouped by groupId
  loading: boolean;
  actions: {
    setExpenses: (expenses: Expense[]) => void;
    setGroupExpenses: (groupId: string, expenses: Expense[]) => void;
    setLoading: (loading: boolean) => void;
    addExpense: (expense: Expense) => void;
    updateExpense: (expenseId: string, updates: Partial<Expense>) => void;
    removeExpense: (expenseId: string) => void;
  };
};

export const useExpensesStore = create<ExpensesStoreType>((set) => ({
  expenses: [],
  groupExpenses: {},
  loading: false,
  actions: {
    setExpenses: (expenses) => set({ expenses }),
    setGroupExpenses: (groupId, expenses) =>
      set((state) => ({
        groupExpenses: { ...state.groupExpenses, [groupId]: expenses },
      })),
    setLoading: (loading) => set({ loading }),
    addExpense: (expense) =>
      set((state) => ({ expenses: [expense, ...state.expenses] })),
    updateExpense: (expenseId, updates) =>
      set((state) => ({
        expenses: state.expenses.map((e) =>
          e.id === expenseId ? { ...e, ...updates } : e
        ),
      })),
    removeExpense: (expenseId) =>
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== expenseId),
      })),
  },
}));

export const useExpenses = () => useExpensesStore((state) => state.expenses);
export const useGroupExpenses = (groupId: string) =>
  useExpensesStore((state) => state.groupExpenses[groupId] || []);
export const useExpensesLoading = () =>
  useExpensesStore((state) => state.loading);
export const useExpensesActions = () =>
  useExpensesStore((state) => state.actions);
