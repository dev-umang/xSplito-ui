export type GroupMember = {
  userId: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role: "admin" | "member";
  joinedAt: Date;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  currency: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  archived?: boolean;
  archivedAt?: Date;
};

export type GroupInput = {
  name: string;
  description?: string;
  currency: string;
  memberEmails: string[]; // Emails of members to add
};

export type GroupWithBalance = Group & {
  totalExpenses: number;
  yourBalance: number; // Positive means you're owed, negative means you owe
  settledAmount: number;
};
