import { useEffect } from "react";
import { onSnapshot, orderBy, query } from "firebase/firestore";
import { fbRefs } from "@/configs/firebase/firebase.nodes";
import { useExpensesActions } from "../store/expenses.store";
import type { Expense } from "../types/expenses.types";

export const useListenGroupExpenses = (groupId: string | undefined) => {
  const { setGroupExpenses, setLoading } = useExpensesActions();

  useEffect(() => {
    console.log(
      `[useListenGroupExpenses] Setup listener for groupId: ${groupId}`,
    );

    if (!groupId) {
      console.log(`[useListenGroupExpenses] No groupId, skipping`);
      return;
    }

    setLoading(true);

    const expensesQuery = query(
      fbRefs.groupExpenses(groupId),
      orderBy("date", "desc"),
    );

    const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      console.log(`[useListenGroupExpenses] Snapshot received for ${groupId}`, {
        expenseCount: snapshot.docs.length,
        hasPendingWrites: snapshot.metadata.hasPendingWrites,
      });

      const expenses: Expense[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          groupId: data.groupId,
          groupName: data.groupName,
          description: data.description,
          amount: data.amount,
          currency: data.currency,
          category: data.category,
          paidBy: data.paidBy,
          splitType: data.splitType,
          participants: data.participants,
          date: data.date?.toDate() || new Date(),
          notes: data.notes,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });

      setGroupExpenses(groupId, expenses);
      setLoading(false);
    });

    return () => {
      console.log(`[useListenGroupExpenses] Cleanup listener for ${groupId}`);
      unsubscribe();
    };
  }, [groupId, setGroupExpenses, setLoading]);
};
