import { useCallback } from "react";
import {
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { fbRefs, fbNodes } from "@/configs/firebase/firebase.nodes";
import { fbStore } from "@/configs/firebase/firebase.config";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { useUserDetails } from "@/modules/auth/store/user.store";
import { toast } from "sonner";
import type { ExpenseInput, ParticipantSplit } from "../types/expenses.types";

export const useAddExpense = () => {
  const authUser = useAuthUser();
  const userDetails = useUserDetails();

  const addExpense = useCallback(
    async (input: ExpenseInput) => {
      if (!authUser || !userDetails) {
        toast.error("You must be logged in");
        return { success: false, expenseId: null };
      }

      try {
        // Get group details
        const groupRef = fbRefs.groups(input.groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (!groupDoc.exists()) {
          toast.error("Group not found");
          return { success: false, expenseId: null };
        }

        const groupData = groupDoc.data();
        const members = (groupData.members || []) as Array<{userId: string; name: string; email: string; photoURL?: string}>;

        // Find payer
        const payer = members.find((m) => m.userId === input.paidById);
        if (!payer) {
          toast.error("Payer not found in group");
          return { success: false, expenseId: null };
        }

        // Calculate splits based on type
        let participants: ParticipantSplit[] = [];
        
        if (input.splitType === "equal") {
          const shareAmount = input.amount / input.participantIds.length;
          participants = input.participantIds.map((userId) => {
            const member = members.find((m) => m.userId === userId);
            return {
              userId,
              userName: member?.name || "Unknown",
              userEmail: member?.email || "",
              userPhoto: member?.photoURL,
              amount: shareAmount,
            };
          });
        } else if (input.splitType === "exact" && input.exactSplits) {
          participants = input.exactSplits.map((split) => {
            const member = members.find((m) => m.userId === split.userId);
            return {
              userId: split.userId,
              userName: member?.name || "Unknown",
              userEmail: member?.email || "",
              userPhoto: member?.photoURL,
              amount: split.amount,
            };
          });
        } else if (input.splitType === "percentage" && input.percentageSplits) {
          participants = input.percentageSplits.map((split) => {
            const member = members.find((m) => m.userId === split.userId);
            const amount = (input.amount * split.percentage) / 100;
            return {
              userId: split.userId,
              userName: member?.name || "Unknown",
              userEmail: member?.email || "",
              userPhoto: member?.photoURL,
              amount,
              percentage: split.percentage,
            };
          });
        }

        // Validate total matches
        const total = participants.reduce((sum, p) => sum + p.amount, 0);
        if (Math.abs(total - input.amount) > 0.01) {
          toast.error("Split amounts don't add up to total");
          return { success: false, expenseId: null };
        }

        // Create expense
        const expenseRef = await addDoc(fbRefs.expensesCollection(), {
          groupId: input.groupId,
          groupName: groupData.name,
          description: input.description.trim(),
          amount: input.amount,
          currency: groupData.currency,
          category: input.category,
          paidBy: {
            userId: payer.userId,
            userName: payer.name,
            userEmail: payer.email,
            userPhoto: payer.photoURL || null,
          },
          splitType: input.splitType,
          participants,
          date: input.date,
          notes: input.notes?.trim() || null,
          createdBy: authUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        toast.success("Expense added successfully!");
        return { success: true, expenseId: expenseRef.id };
      } catch (error) {
        console.error("Error adding expense:", error);
        toast.error("Failed to add expense");
        return { success: false, expenseId: null };
      }
    },
    [authUser, userDetails]
  );

  return { addExpense };
};

export const useUpdateExpense = () => {
  const updateExpense = useCallback(
    async (expenseId: string, updates: Partial<ExpenseInput>) => {
      try {
        const expenseRef = doc(fbStore, fbNodes.expenses, expenseId);
        await updateDoc(expenseRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });

        toast.success("Expense updated successfully!");
        return { success: true };
      } catch (error) {
        console.error("Error updating expense:", error);
        toast.error("Failed to update expense");
        return { success: false };
      }
    },
    []
  );

  return { updateExpense };
};

export const useDeleteExpense = () => {
  const deleteExpense = useCallback(
    async (expenseId: string, description: string) => {
      try {
        const expenseRef = doc(fbStore, fbNodes.expenses, expenseId);
        await deleteDoc(expenseRef);

        toast.success(`Expense "${description}" deleted`);
        return { success: true };
      } catch (error) {
        console.error("Error deleting expense:", error);
        toast.error("Failed to delete expense");
        return { success: false };
      }
    },
    []
  );

  return { deleteExpense };
};
