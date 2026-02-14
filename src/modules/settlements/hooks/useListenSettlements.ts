import { useEffect, useRef } from "react";
import { onSnapshot, query } from "firebase/firestore";
import { fbRefs } from "@/configs/firebase/firebase.nodes";
import { useSettlementsStore } from "../store/settlements.store";
import type { Settlement } from "../types/settlements.types";

export const useListenSettlements = (groupId?: string) => {
  const actionsRef = useRef(useSettlementsStore.getState().actions);

  useEffect(() => {
    if (!groupId) return;

    const settlementsQuery = fbRefs.groupSettlements(groupId);

    const unsubscribe = onSnapshot(
      settlementsQuery,
      (snapshot) => {
        const settlements = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Settlement;
        });

        actionsRef.current.setSettlements(settlements);
      },
      (error) => {
        console.error("Error listening to settlements:", error);
      }
    );

    return () => {
      unsubscribe();
      const actions = actionsRef.current;
      actions.clearSettlements();
    };
  }, [groupId]);
};
