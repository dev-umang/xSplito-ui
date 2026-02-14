import { create } from "zustand";
import { useMemo } from "react";
import type { Settlement } from "../types/settlements.types";

type SettlementsStore = {
  settlements: Settlement[];
  actions: {
    setSettlements: (settlements: Settlement[]) => void;
    addSettlement: (settlement: Settlement) => void;
    updateSettlement: (settlement: Settlement) => void;
    removeSettlement: (settlementId: string) => void;
    clearSettlements: () => void;
  };
};

export const useSettlementsStore = create<SettlementsStore>((set) => ({
  settlements: [],
  actions: {
    setSettlements: (settlements) => set({ settlements }),
    addSettlement: (settlement) =>
      set((state) => ({
        settlements: [...state.settlements, settlement],
      })),
    updateSettlement: (settlement) =>
      set((state) => ({
        settlements: state.settlements.map((s) =>
          s.id === settlement.id ? settlement : s,
        ),
      })),
    removeSettlement: (settlementId) =>
      set((state) => ({
        settlements: state.settlements.filter((s) => s.id !== settlementId),
      })),
    clearSettlements: () => set({ settlements: [] }),
  },
}));

// Selectors
export const useSettlements = () =>
  useSettlementsStore((state) => state.settlements);
export const useSettlementActions = () =>
  useSettlementsStore((state) => state.actions);

// Get settlements for a specific group - memoized to prevent infinite loops
export const useGroupSettlements = (groupId?: string): Settlement[] => {
  const allSettlements = useSettlementsStore((state) => state.settlements);
  
  return useMemo(() => {
    if (!groupId) return [];
    return allSettlements.filter((s) => s.groupId === groupId);
  }, [allSettlements, groupId]);
};
