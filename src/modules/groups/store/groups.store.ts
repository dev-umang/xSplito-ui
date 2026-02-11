import { create } from "zustand";
import type { Group } from "../types/groups.types";

type GroupsStoreType = {
  groups: Group[];
  selectedGroup: Group | null;
  loading: boolean;
  actions: {
    setGroups: (groups: Group[]) => void;
    setSelectedGroup: (group: Group | null) => void;
    setLoading: (loading: boolean) => void;
    addGroup: (group: Group) => void;
    updateGroup: (groupId: string, updates: Partial<Group>) => void;
    removeGroup: (groupId: string) => void;
  };
};

export const useGroupsStore = create<GroupsStoreType>((set) => ({
  groups: [],
  selectedGroup: null,
  loading: false,
  actions: {
    setGroups: (groups) => set({ groups }),
    setSelectedGroup: (group) => set({ selectedGroup: group }),
    setLoading: (loading) => set({ loading }),
    addGroup: (group) =>
      set((state) => ({ groups: [...state.groups, group] })),
    updateGroup: (groupId, updates) =>
      set((state) => ({
        groups: state.groups.map((g) =>
          g.id === groupId ? { ...g, ...updates } : g
        ),
        selectedGroup:
          state.selectedGroup?.id === groupId
            ? { ...state.selectedGroup, ...updates }
            : state.selectedGroup,
      })),
    removeGroup: (groupId) =>
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== groupId),
        selectedGroup:
          state.selectedGroup?.id === groupId ? null : state.selectedGroup,
      })),
  },
}));

export const useGroups = () => useGroupsStore((state) => state.groups);
export const useSelectedGroup = () =>
  useGroupsStore((state) => state.selectedGroup);
export const useGroupsLoading = () => useGroupsStore((state) => state.loading);
export const useGroupsActions = () => useGroupsStore((state) => state.actions);
