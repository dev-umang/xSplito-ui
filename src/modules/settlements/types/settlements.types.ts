export type Settlement = {
  id: string;
  groupId: string;
  groupName: string;
  fromUser: {
    userId: string;
    userName: string;
    userEmail: string;
    userPhoto?: string;
  };
  toUser: {
    userId: string;
    userName: string;
    userEmail: string;
    userPhoto?: string;
  };
  amount: number;
  currency: string;
  date: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSettlementRequest = {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  date: Date;
  notes?: string;
};
