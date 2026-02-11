import { useCallback } from "react";
import {
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { fbRefs, fbNodes } from "@/configs/firebase/firebase.nodes";
import { fbStore } from "@/configs/firebase/firebase.config";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { useUserDetails } from "@/modules/auth/store/user.store";
import { toast } from "sonner";

export const useSendFriendRequest = () => {
  const authUser = useAuthUser();
  const userDetails = useUserDetails();

  const sendRequest = useCallback(
    async (toUserEmail: string) => {
      if (!authUser || !userDetails) {
        toast.error("You must be logged in");
        return { success: false };
      }

      try {
        // Search for user by email
        const usersRef = fbRefs.usersCollection();
        const q = query(usersRef, where("email", "==", toUserEmail.toLowerCase()));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          toast.error("User not found with that email");
          return { success: false };
        }

        const toUser = snapshot.docs[0];
        const toUserData = toUser.data();

        if (toUser.id === authUser.uid) {
          toast.error("You cannot send a friend request to yourself");
          return { success: false };
        }

        // Check if already friends
        const friendshipsRef = fbRefs.friendshipsCollection();
        const friendshipQuery = query(
          friendshipsRef,
          where("users", "array-contains", authUser.uid)
        );
        const friendships = await getDocs(friendshipQuery);
        const alreadyFriends = friendships.docs.some((doc) => {
          const users = doc.data().users as string[];
          return users.includes(toUser.id);
        });

        if (alreadyFriends) {
          toast.error("You are already friends with this user");
          return { success: false };
        }

        // Check if request already exists
        const requestsRef = fbRefs.friendRequestsCollection();
        const existingQuery = query(
          requestsRef,
          where("fromUserId", "==", authUser.uid),
          where("toUserId", "==", toUser.id),
          where("status", "==", "pending")
        );
        const existing = await getDocs(existingQuery);

        if (!existing.empty) {
          toast.error("Friend request already sent");
          return { success: false };
        }

        // Create friend request
        await addDoc(requestsRef, {
          fromUserId: authUser.uid,
          fromUserName: userDetails.displayName,
          fromUserEmail: userDetails.email,
          fromUserPhoto: userDetails.photoURL || null,
          toUserId: toUser.id,
          toUserName: toUserData.displayName,
          toUserEmail: toUserData.email,
          status: "pending",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        toast.success(`Friend request sent to ${toUserData.displayName}`);
        return { success: true };
      } catch (error) {
        console.error("Error sending friend request:", error);
        toast.error("Failed to send friend request");
        return { success: false };
      }
    },
    [authUser, userDetails]
  );

  return { sendRequest };
};

export const useAcceptFriendRequest = () => {
  const authUser = useAuthUser();

  const acceptRequest = useCallback(
    async (requestId: string, fromUserId: string, fromUserName: string, fromUserEmail: string, fromUserPhoto?: string) => {
      if (!authUser) {
        toast.error("You must be logged in");
        return { success: false };
      }

      try {
        // Update request status
        const requestRef = doc(fbStore, fbNodes.friendRequests, requestId);
        await updateDoc(requestRef, {
          status: "accepted",
          updatedAt: serverTimestamp(),
        });

        // Create friendship
        const friendshipsRef = fbRefs.friendshipsCollection();
        await addDoc(friendshipsRef, {
          users: [authUser.uid, fromUserId],
          userDetails: {
            [authUser.uid]: {
              name: authUser.displayName || "Unknown",
              email: authUser.email || "",
              photoURL: authUser.photoURL || null,
            },
            [fromUserId]: {
              name: fromUserName,
              email: fromUserEmail,
              photoURL: fromUserPhoto || null,
            },
          },
          createdAt: serverTimestamp(),
        });

        toast.success(`You are now friends with ${fromUserName}`);
        return { success: true };
      } catch (error) {
        console.error("Error accepting friend request:", error);
        toast.error("Failed to accept friend request");
        return { success: false };
      }
    },
    [authUser]
  );

  return { acceptRequest };
};

export const useRejectFriendRequest = () => {
  const rejectRequest = useCallback(async (requestId: string) => {
    try {
      const requestRef = doc(fbStore, fbNodes.friendRequests, requestId);
      await updateDoc(requestRef, {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });

      toast.success("Friend request rejected");
      return { success: true };
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Failed to reject friend request");
      return { success: false };
    }
  }, []);

  return { rejectRequest };
};

export const useRemoveFriend = () => {
  const authUser = useAuthUser();

  const removeFriend = useCallback(
    async (friendshipId: string, friendName: string) => {
      if (!authUser) {
        toast.error("You must be logged in");
        return { success: false };
      }

      try {
        const friendshipRef = doc(fbStore, fbNodes.friendships, friendshipId);
        await deleteDoc(friendshipRef);

        toast.success(`Removed ${friendName} from friends`);
        return { success: true };
      } catch (error) {
        console.error("Error removing friend:", error);
        toast.error("Failed to remove friend");
        return { success: false };
      }
    },
    [authUser]
  );

  return { removeFriend };
};
