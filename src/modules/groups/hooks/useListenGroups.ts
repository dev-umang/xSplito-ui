import { useEffect, useRef } from "react";
import { onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { fbRefs } from "@/configs/firebase/firebase.nodes";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { useGroupsStore } from "../store/groups.store";
import type { Group, GroupMember } from "../types/groups.types";

// Type for raw Firestore member data
interface FirestoreMemberData {
  userId: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role: "admin" | "member";
  joinedAt?: Timestamp | Date;
}

export const useListenGroups = () => {
  const authUser = useAuthUser();
  const actionsRef = useRef(useGroupsStore.getState().actions);

  useEffect(() => {
    if (!authUser?.uid) {
      actionsRef.current.setGroups([]);
      actionsRef.current.setLoading(false);
      return;
    }

    actionsRef.current.setLoading(true);
    const groupsQuery = query(
      fbRefs.userGroups(authUser.uid),
      orderBy("updatedAt", "desc"),
    );

    const unsubscribe = onSnapshot(groupsQuery, (snapshot) => {
      const groups: Group[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description || undefined,
          imageUrl: data.imageUrl || undefined,
          currency: data.currency,
          members: (data.members || []).map(
            (m: FirestoreMemberData): GroupMember => ({
              userId: m.userId,
              name: m.name,
              email: m.email,
              photoURL: m.photoURL,
              role: m.role,
              joinedAt:
                m.joinedAt && "toDate" in m.joinedAt
                  ? m.joinedAt.toDate()
                  : new Date(),
            }),
          ),
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });

      actionsRef.current.setGroups(groups);
      actionsRef.current.setLoading(false);
    });

    return () => unsubscribe();
  }, [authUser?.uid]);
};

export const useListenGroupDetails = (groupId: string | undefined) => {
  const actionsRef = useRef(useGroupsStore.getState().actions);

  useEffect(() => {
    console.log(
      `[useListenGroupDetails] Setup listener for groupId: ${groupId}`,
    );

    if (!groupId) {
      console.log(
        `[useListenGroupDetails] No groupId, clearing selected group`,
      );
      actionsRef.current.setSelectedGroup(null);
      return;
    }

    actionsRef.current.setLoading(true);

    const groupRef = fbRefs.groups(groupId);
    const unsubscribe = onSnapshot(groupRef, (doc) => {
      console.log(`[useListenGroupDetails] Snapshot received for ${groupId}`, {
        exists: doc.exists(),
        hasPendingWrites: doc.metadata.hasPendingWrites,
      });

      if (doc.exists()) {
        const data = doc.data();
        const group: Group = {
          id: doc.id,
          name: data.name,
          description: data.description || undefined,
          imageUrl: data.imageUrl || undefined,
          currency: data.currency,
          members: (data.members || []).map(
            (m: FirestoreMemberData): GroupMember => ({
              userId: m.userId,
              name: m.name,
              email: m.email,
              photoURL: m.photoURL,
              role: m.role,
              joinedAt:
                m.joinedAt && "toDate" in m.joinedAt
                  ? m.joinedAt.toDate()
                  : new Date(),
            }),
          ),
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
        console.log(`[useListenGroupDetails] Setting group:`, {
          id: group.id,
          name: group.name,
          memberCount: group.members.length,
        });
        actionsRef.current.setSelectedGroup(group);
      } else {
        console.log(`[useListenGroupDetails] Group not found`);
        actionsRef.current.setSelectedGroup(null);
      }
      actionsRef.current.setLoading(false);
    });

    return () => {
      console.log(`[useListenGroupDetails] Cleanup listener for ${groupId}`);
      unsubscribe();
    };
  }, [groupId]);
};
