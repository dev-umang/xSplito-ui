export type UserBalance = {
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  totalPaid: number; // Total amount this user paid
  totalOwed: number; // Total amount this user owes
  netBalance: number; // Positive means they're owed, negative means they owe
};

export type DebtEdge = {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
};

export type GroupBalances = {
  groupId: string;
  userBalances: UserBalance[];
  simplifiedDebts: DebtEdge[]; // Minimized list of who owes whom
  totalExpenses: number;
  lastCalculated: Date;
};
