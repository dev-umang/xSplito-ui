export type FriendRequest = {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserPhoto?: string;
  toUserId: string;
  toUserName: string;
  toUserEmail: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
};

export type Friendship = {
  id: string;
  users: [string, string]; // Array of two user IDs
  userDetails: {
    [userId: string]: {
      name: string;
      email: string;
      photoURL?: string;
    };
  };
  createdAt: Date;
};

export type FriendRequestInput = {
  toUserEmail: string;
};
