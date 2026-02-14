import { create } from "zustand";
import { useMemo } from "react";
import type { GroupBalances } from "../types/balances.types";

type BalancesStoreType = {
  groupBalances: Record<string, GroupBalances>; // Balances by groupId
  loading: boolean;
  actions: {
    setGroupBalances: (groupId: string, balances: GroupBalances) => void;
    setLoading: (loading: boolean) => void;
    clearGroupBalances: (groupId: string) => void;
  };
};

export const useBalancesStore = create<BalancesStoreType>((set, get) => ({
  groupBalances: {},
  loading: false,
  actions: {
    setGroupBalances: (groupId, balances) => {
      const current = get().groupBalances[groupId];
      // Only update if balances actually changed
      const currentStr = JSON.stringify(current);
      const newStr = JSON.stringify(balances);
      
      if (currentStr === newStr) {
        console.log(`[BalancesStore] Skipping update for ${groupId} - no changes`);
        return;
      }
      
      console.log(`[BalancesStore] Updating balances for ${groupId}`, {
        userBalances: balances.userBalances.length,
        simplifiedDebts: balances.simplifiedDebts.length,
      });
      
      set((state) => ({
        groupBalances: { ...state.groupBalances, [groupId]: balances },
      }));
    },
    setLoading: (loading) => set({ loading }),
    clearGroupBalances: (groupId) =>
      set((state) => {
        const newBalances = { ...state.groupBalances };
        delete newBalances[groupId];
        return { groupBalances: newBalances };
      }),
  },
}));

export const useGroupBalances = (groupId: string) =>
  useBalancesStore((state) => state.groupBalances[groupId]);

export const useBalances = (): GroupBalances[] => {
  const groupBalances = useBalancesStore((state) => state.groupBalances);
  return useMemo(() => Object.values(groupBalances), [groupBalances]);
};

export const useBalancesLoading = () =>
  useBalancesStore((state) => state.loading);
export const useBalancesActions = () =>
  useBalancesStore((state) => state.actions);
