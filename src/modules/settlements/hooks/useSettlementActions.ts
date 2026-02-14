import {
  addDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { fbStore } from "@/configs/firebase/firebase.config";
import { fbNodes, fbRefs } from "@/configs/firebase/firebase.nodes";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import type { CreateSettlementRequest } from "../types/settlements.types";
import { toast } from "sonner";
import { useState } from "react";

export const useAddSettlement = () => {
  const authUser = useAuthUser();
  const [loading, setLoading] = useState(false);

  const addSettlement = async (request: CreateSettlementRequest) => {
    if (!authUser) {
      toast.error("You must be logged in to record settlements");
      return { success: false };
    }

    setLoading(true);

    try {
      // Get group details
      const groupRef = doc(fbStore, fbNodes.groups, request.groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        toast.error("Group not found");
        return { success: false };
      }

      const groupData = groupSnap.data();

      // Get fromUser details
      const fromUserRef = doc(fbStore, fbNodes.users, request.fromUserId);
      const fromUserSnap = await getDoc(fromUserRef);

      if (!fromUserSnap.exists()) {
        toast.error("From user not found");
        return { success: false };
      }

      const fromUserData = fromUserSnap.data();

      // Get toUser details
      const toUserRef = doc(fbStore, fbNodes.users, request.toUserId);
      const toUserSnap = await getDoc(toUserRef);

      if (!toUserSnap.exists()) {
        toast.error("To user not found");
        return { success: false };
      }

      const toUserData = toUserSnap.data();

      // Create settlement
      const settlementData = {
        groupId: request.groupId,
        groupName: groupData.name,
        fromUser: {
          userId: request.fromUserId,
          userName: fromUserData.displayName,
          userEmail: fromUserData.email,
          userPhoto: fromUserData.photoURL || undefined,
        },
        toUser: {
          userId: request.toUserId,
          userName: toUserData.displayName,
          userEmail: toUserData.email,
          userPhoto: toUserData.photoURL || undefined,
        },
        amount: request.amount,
        currency: groupData.currency,
        date: request.date,
        notes: request.notes || "",
        createdBy: authUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(fbRefs.settlementsCollection(), settlementData);

      // Create activity for settlement
      await addDoc(fbRefs.activitiesCollection(), {
        type: "settlement",
        groupId: request.groupId,
        groupName: groupData.name,
        userId: authUser.uid,
        userName: authUser.displayName || "Unknown",
        description: `${fromUserData.displayName} paid ${toUserData.displayName} ${groupData.currency} ${request.amount.toFixed(2)}`,
        metadata: {
          settlementId: docRef.id,
          fromUserId: request.fromUserId,
          fromUserName: fromUserData.displayName,
          toUserId: request.toUserId,
          toUserName: toUserData.displayName,
          amount: request.amount,
          currency: groupData.currency,
        },
        createdAt: serverTimestamp(),
      });

      toast.success("Settlement recorded successfully");
      return { success: true, settlementId: docRef.id };
    } catch (error) {
      console.error("Error adding settlement:", error);
      toast.error("Failed to record settlement");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { addSettlement, loading };
};

export const useDeleteSettlement = () => {
  const authUser = useAuthUser();
  const [loading, setLoading] = useState(false);

  const deleteSettlement = async (settlementId: string) => {
    if (!authUser) {
      toast.error("You must be logged in");
      return { success: false };
    }

    setLoading(true);

    try {
      await deleteDoc(fbRefs.settlements(settlementId));
      toast.success("Settlement deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("Error deleting settlement:", error);
      toast.error("Failed to delete settlement");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { deleteSettlement, loading };
};

export const useUpdateSettlement = () => {
  const authUser = useAuthUser();
  const [loading, setLoading] = useState(false);

  const updateSettlement = async (
    settlementId: string,
    updates: Partial<CreateSettlementRequest>
  ) => {
    if (!authUser) {
      toast.error("You must be logged in");
      return { success: false };
    }

    setLoading(true);

    try {
      const settlementRef = fbRefs.settlements(settlementId);
      await updateDoc(settlementRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      toast.success("Settlement updated successfully");
      return { success: true };
    } catch (error) {
      console.error("Error updating settlement:", error);
      toast.error("Failed to update settlement");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { updateSettlement, loading };
};
