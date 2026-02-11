export type SplitType = "equal" | "exact" | "percentage";

export type ParticipantSplit = {
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  amount: number; // Amount this person owes or paid
  percentage?: number; // For percentage splits
};

export type Expense = {
  id: string;
  groupId: string;
  groupName: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  paidBy: {
    userId: string;
    userName: string;
    userEmail: string;
    userPhoto?: string;
  };
  splitType: SplitType;
  participants: ParticipantSplit[]; // All people involved and their shares
  date: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ExpenseInput = {
  groupId: string;
  description: string;
  amount: number;
  category: string;
  paidById: string; // User ID of who paid
  splitType: SplitType;
  participantIds: string[]; // For equal split
  exactSplits?: { userId: string; amount: number }[]; // For exact split
  percentageSplits?: { userId: string; percentage: number }[]; // For percentage split
  date: Date;
  notes?: string;
};

export const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & Drink", icon: "🍔" },
  { value: "transportation", label: "Transportation", icon: "🚗" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "home", label: "Home & Utilities", icon: "🏠" },
  { value: "travel", label: "Travel & Vacation", icon: "✈️" },
  { value: "health", label: "Health & Wellness", icon: "💊" },
  { value: "other", label: "Other", icon: "📌" },
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]["value"];
