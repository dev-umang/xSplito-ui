import { useEffect } from "react";
import { onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { fbRefs } from "@/configs/firebase/firebase.nodes";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { useGroupsActions } from "../store/groups.store";
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
  const { setGroups, setLoading } = useGroupsActions();

  useEffect(() => {
    if (!authUser?.uid) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);

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
          members: (data.members || []).map((m: FirestoreMemberData): GroupMember => ({
            userId: m.userId,
            name: m.name,
            email: m.email,
            photoURL: m.photoURL,
            role: m.role,
            joinedAt: m.joinedAt && 'toDate' in m.joinedAt ? m.joinedAt.toDate() : new Date(),
          })),
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });

      setGroups(groups);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authUser?.uid, setGroups, setLoading]);
};

export const useListenGroupDetails = (groupId: string | undefined) => {
  const { setSelectedGroup, setLoading } = useGroupsActions();

  useEffect(() => {
    if (!groupId) {
      setSelectedGroup(null);
      return;
    }

    setLoading(true);

    const groupRef = fbRefs.groups(groupId);
    const unsubscribe = onSnapshot(groupRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const group: Group = {
          id: doc.id,
          name: data.name,
          description: data.description || undefined,
          imageUrl: data.imageUrl || undefined,
          currency: data.currency,
          members: (data.members || []).map((m: FirestoreMemberData): GroupMember => ({
            userId: m.userId,
            name: m.name,
            email: m.email,
            photoURL: m.photoURL,
            role: m.role,
            joinedAt: m.joinedAt && 'toDate' in m.joinedAt ? m.joinedAt.toDate() : new Date(),
          })),
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
        setSelectedGroup(group);
      } else {
        setSelectedGroup(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId, setSelectedGroup, setLoading]);
};
