import { doc, collection, query, where } from "firebase/firestore";
import { fbStore } from "./firebase.config";

const n = (node: string) =>
  import.meta.env.VITE_NODE_PREFIX
    ? `${import.meta.env.VITE_NODE_PREFIX}_${node.toUpperCase()}`
    : node.toUpperCase();

export const fbNodes = {
  users: n("users"),
  groups: n("groups"),
  expenses: n("expenses"),
  settlements: n("settlements"),
  friendRequests: n("friend_requests"),
  friendships: n("friendships"),
  activities: n("activities"),
  notifications: n("notifications"),
};

export const fbRefs = {
  // Users
  users: (uid: string) => doc(fbStore, fbNodes.users, uid),
  usersCollection: () => collection(fbStore, fbNodes.users),

  // Groups
  groups: (groupId: string) => doc(fbStore, fbNodes.groups, groupId),
  groupsCollection: () => collection(fbStore, fbNodes.groups),
  userGroups: (userId: string) =>
    query(
      collection(fbStore, fbNodes.groups),
      where("members", "array-contains", userId)
    ),

  // Expenses
  expenses: (expenseId: string) => doc(fbStore, fbNodes.expenses, expenseId),
  expensesCollection: () => collection(fbStore, fbNodes.expenses),
  groupExpenses: (groupId: string) =>
    query(
      collection(fbStore, fbNodes.expenses),
      where("groupId", "==", groupId)
    ),

  // Settlements
  settlements: (settlementId: string) =>
    doc(fbStore, fbNodes.settlements, settlementId),
  settlementsCollection: () => collection(fbStore, fbNodes.settlements),
  groupSettlements: (groupId: string) =>
    query(
      collection(fbStore, fbNodes.settlements),
      where("groupId", "==", groupId)
    ),

  // Friend Requests
  friendRequests: (requestId: string) =>
    doc(fbStore, fbNodes.friendRequests, requestId),
  friendRequestsCollection: () => collection(fbStore, fbNodes.friendRequests),
  receivedFriendRequests: (userId: string) =>
    query(
      collection(fbStore, fbNodes.friendRequests),
      where("toUserId", "==", userId),
      where("status", "==", "pending")
    ),
  sentFriendRequests: (userId: string) =>
    query(
      collection(fbStore, fbNodes.friendRequests),
      where("fromUserId", "==", userId),
      where("status", "==", "pending")
    ),

  // Friendships
  friendships: (friendshipId: string) =>
    doc(fbStore, fbNodes.friendships, friendshipId),
  friendshipsCollection: () => collection(fbStore, fbNodes.friendships),
  userFriendships: (userId: string) =>
    query(
      collection(fbStore, fbNodes.friendships),
      where("users", "array-contains", userId)
    ),

  // Activities
  activities: (activityId: string) =>
    doc(fbStore, fbNodes.activities, activityId),
  activitiesCollection: () => collection(fbStore, fbNodes.activities),
  userActivities: (userId: string) =>
    query(
      collection(fbStore, fbNodes.activities),
      where("participants", "array-contains", userId)
    ),
  groupActivities: (groupId: string) =>
    query(
      collection(fbStore, fbNodes.activities),
      where("groupId", "==", groupId)
    ),

  // Notifications
  notifications: (notificationId: string) =>
    doc(fbStore, fbNodes.notifications, notificationId),
  notificationsCollection: () => collection(fbStore, fbNodes.notifications),
  userNotifications: (userId: string) =>
    query(
      collection(fbStore, fbNodes.notifications),
      where("userId", "==", userId)
    ),
}
