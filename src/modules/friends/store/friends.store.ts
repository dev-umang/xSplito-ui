import { create } from "zustand";
import type { Friendship, FriendRequest } from "../types/friends.types";

type FriendsStoreType = {
  friends: Friendship[];
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  loading: boolean;
  actions: {
    setFriends: (friends: Friendship[]) => void;
    setReceivedRequests: (requests: FriendRequest[]) => void;
    setSentRequests: (requests: FriendRequest[]) => void;
    setLoading: (loading: boolean) => void;
    addFriend: (friendship: Friendship) => void;
    removeFriend: (friendshipId: string) => void;
    updateRequest: (requestId: string, status: FriendRequest["status"]) => void;
  };
};

export const useFriendsStore = create<FriendsStoreType>((set) => ({
  friends: [],
  receivedRequests: [],
  sentRequests: [],
  loading: false,
  actions: {
    setFriends: (friends) => set({ friends }),
    setReceivedRequests: (requests) => set({ receivedRequests: requests }),
    setSentRequests: (requests) => set({ sentRequests: requests }),
    setLoading: (loading) => set({ loading }),
    addFriend: (friendship) =>
      set((state) => ({ friends: [...state.friends, friendship] })),
    removeFriend: (friendshipId) =>
      set((state) => ({
        friends: state.friends.filter((f) => f.id !== friendshipId),
      })),
    updateRequest: (requestId, status) =>
      set((state) => ({
        receivedRequests: state.receivedRequests.map((r) =>
          r.id === requestId ? { ...r, status } : r
        ),
        sentRequests: state.sentRequests.map((r) =>
          r.id === requestId ? { ...r, status } : r
        ),
      })),
  },
}));

export const useFriends = () => useFriendsStore((state) => state.friends);
export const useReceivedRequests = () =>
  useFriendsStore((state) => state.receivedRequests);
export const useSentRequests = () =>
  useFriendsStore((state) => state.sentRequests);
export const useFriendsLoading = () =>
  useFriendsStore((state) => state.loading);
export const useFriendsActions = () =>
  useFriendsStore((state) => state.actions);
