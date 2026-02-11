import { useEffect, useRef } from "react";
import { onSnapshot } from "firebase/firestore";
import { fbRefs } from "@/configs/firebase/firebase.nodes";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { useFriendsStore } from "../store/friends.store";
import type { Friendship, FriendRequest } from "../types/friends.types";

export const useListenFriends = () => {
  const authUser = useAuthUser();
  const actionsRef = useRef(useFriendsStore.getState().actions);

  useEffect(() => {
    if (!authUser?.uid) {
      actionsRef.current.setFriends([]);
      actionsRef.current.setReceivedRequests([]);
      actionsRef.current.setSentRequests([]);
      actionsRef.current.setLoading(false);
      return;
    }

    actionsRef.current.setLoading(true);
    const unsubscribers: (() => void)[] = [];

    // Listen to friendships
    const friendshipsQuery = fbRefs.userFriendships(authUser.uid);
    const unsubFriendships = onSnapshot(friendshipsQuery, (snapshot) => {
      const friendships: Friendship[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          users: data.users as [string, string],
          userDetails: data.userDetails,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      actionsRef.current.setFriends(friendships);
      actionsRef.current.setLoading(false);
    });
    unsubscribers.push(unsubFriendships);

    // Listen to received friend requests
    const receivedQuery = fbRefs.receivedFriendRequests(authUser.uid);
    const unsubReceived = onSnapshot(receivedQuery, (snapshot) => {
      const requests: FriendRequest[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          fromUserId: data.fromUserId,
          fromUserName: data.fromUserName,
          fromUserEmail: data.fromUserEmail,
          fromUserPhoto: data.fromUserPhoto,
          toUserId: data.toUserId,
          toUserName: data.toUserName,
          toUserEmail: data.toUserEmail,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
      actionsRef.current.setReceivedRequests(requests);
    });
    unsubscribers.push(unsubReceived);

    // Listen to sent friend requests
    const sentQuery = fbRefs.sentFriendRequests(authUser.uid);
    const unsubSent = onSnapshot(sentQuery, (snapshot) => {
      const requests: FriendRequest[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          fromUserId: data.fromUserId,
          fromUserName: data.fromUserName,
          fromUserEmail: data.fromUserEmail,
          fromUserPhoto: data.fromUserPhoto,
          toUserId: data.toUserId,
          toUserName: data.toUserName,
          toUserEmail: data.toUserEmail,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
      actionsRef.current.setSentRequests(requests);
    });
    unsubscribers.push(unsubSent);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [authUser?.uid]);
};
