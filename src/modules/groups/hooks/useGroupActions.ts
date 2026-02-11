import { useCallback } from "react";
import {
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { fbRefs, fbNodes } from "@/configs/firebase/firebase.nodes";
import { fbStore } from "@/configs/firebase/firebase.config";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { useUserDetails } from "@/modules/auth/store/user.store";
import { toast } from "sonner";
import type { GroupInput, GroupMember } from "../types/groups.types";

export const useCreateGroup = () => {
  const authUser = useAuthUser();
  const userDetails = useUserDetails();

  const createGroup = useCallback(
    async (input: GroupInput) => {
      if (!authUser || !userDetails) {
        toast.error("You must be logged in");
        return { success: false, groupId: null };
      }

      try {
        // Initialize members with the creator
        const members: GroupMember[] = [
          {
            userId: authUser.uid,
            name: userDetails.displayName,
            email: userDetails.email,
            photoURL: userDetails.photoURL,
            role: "admin",
            joinedAt: new Date(),
          },
        ];

        // Add other members by email
        if (input.memberEmails && input.memberEmails.length > 0) {
          for (const email of input.memberEmails) {
            const usersRef = fbRefs.usersCollection();
            const q = query(usersRef, where("email", "==", email.toLowerCase()));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
              const userData = snapshot.docs[0].data();
              members.push({
                userId: snapshot.docs[0].id,
                name: userData.displayName,
                email: userData.email,
                photoURL: userData.photoURL,
                role: "member",
                joinedAt: new Date(),
              });
            }
          }
        }

        // Create group document
        const now = new Date();
        const groupRef = await addDoc(fbRefs.groupsCollection(), {
          name: input.name.trim(),
          description: input.description?.trim() || null,
          imageUrl: null,
          currency: input.currency,
          members: members.map((m) => ({
            ...m,
            joinedAt: now,
          })),
          memberIds: members.map((m) => m.userId), // For efficient querying
          createdBy: authUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        toast.success(`Group "${input.name}" created successfully!`);
        return { success: true, groupId: groupRef.id };
      } catch (error) {
        console.error("Error creating group:", error);
        toast.error("Failed to create group");
        return { success: false, groupId: null };
      }
    },
    [authUser, userDetails]
  );

  return { createGroup };
};

export const useUpdateGroup = () => {
  const updateGroup = useCallback(
    async (groupId: string, updates: Partial<GroupInput>) => {
      try {
        const groupRef = doc(fbStore, fbNodes.groups, groupId);
        await updateDoc(groupRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });

        toast.success("Group updated successfully!");
        return { success: true };
      } catch (error) {
        console.error("Error updating group:", error);
        toast.error("Failed to update group");
        return { success: false };
      }
    },
    []
  );

  return { updateGroup };
};

export const useDeleteGroup = () => {
  const authUser = useAuthUser();

  const deleteGroup = useCallback(
    async (groupId: string, groupName: string) => {
      if (!authUser) {
        toast.error("You must be logged in");
        return { success: false };
      }

      try {
        const groupRef = doc(fbStore, fbNodes.groups, groupId);
        await deleteDoc(groupRef);

        toast.success(`Group "${groupName}" deleted successfully`);
        return { success: true };
      } catch (error) {
        console.error("Error deleting group:", error);
        toast.error("Failed to delete group");
        return { success: false };
      }
    },
    [authUser]
  );

  return { deleteGroup };
};

export const useAddGroupMember = () => {
  const addMember = useCallback(
    async (groupId: string, memberEmail: string) => {
      try {
        // Find user by email
        const usersRef = fbRefs.usersCollection();
        const q = query(usersRef, where("email", "==", memberEmail.toLowerCase()));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          toast.error("User not found with that email");
          return { success: false };
        }

        const userData = snapshot.docs[0].data();
        const userId = snapshot.docs[0].id;

        // Get current group
        const groupRef = doc(fbStore, fbNodes.groups, groupId);
        const groupDoc = await getDocs(query(fbRefs.groupsCollection()));
        const groupData = groupDoc.docs.find((d) => d.id === groupId)?.data();

        if (!groupData) {
          toast.error("Group not found");
          return { success: false };
        }

        // Check if user is already a member
        const members = (groupData.members || []) as GroupMember[];
        if (members.some((m) => m.userId === userId)) {
          toast.error("User is already a member of this group");
          return { success: false };
        }

        // Add new member
        const newMember = {
          userId,
          name: userData.displayName,
          email: userData.email,
          photoURL: userData.photoURL || null,
          role: "member",
          joinedAt: new Date(),
        };

        await updateDoc(groupRef, {
          members: [...members, newMember],
          memberIds: [...members.map(m => m.userId), userId],
          updatedAt: serverTimestamp(),
        });

        toast.success(`Added ${userData.displayName} to the group`);
        return { success: true };
      } catch (error) {
        console.error("Error adding member:", error);
        toast.error("Failed to add member");
        return { success: false };
      }
    },
    []
  );

  return { addMember };
};

export const useRemoveGroupMember = () => {
  const removeMember = useCallback(
    async (groupId: string, userId: string, memberName: string) => {
      try {
        const groupRef = doc(fbStore, fbNodes.groups, groupId);
        const groupDoc = await getDocs(query(fbRefs.groupsCollection()));
        const groupData = groupDoc.docs.find((d) => d.id === groupId)?.data();

        if (!groupData) {
          toast.error("Group not found");
          return { success: false };
        }

        const members = ((groupData.members || []) as GroupMember[]).filter(
          (m) => m.userId !== userId
        );

        await updateDoc(groupRef, {
          members,
          memberIds: members.map(m => m.userId),
          updatedAt: serverTimestamp(),
        });

        toast.success(`Removed ${memberName} from the group`);
        return { success: true };
      } catch (error) {
        console.error("Error removing member:", error);
        toast.error("Failed to remove member");
        return { success: false };
      }
    },
    []
  );

  return { removeMember };
};
