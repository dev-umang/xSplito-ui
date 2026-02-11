export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  defaultCurrency: string;
  createdAt: Date;
  updatedAt: Date;
  profileCompleted: boolean;
};

export type UserProfileInput = {
  displayName: string;
  phoneNumber?: string;
  defaultCurrency: string;
};

export const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£" },
  { value: "INR", label: "INR - Indian Rupee", symbol: "₹" },
  { value: "JPY", label: "JPY - Japanese Yen", symbol: "¥" },
  { value: "AUD", label: "AUD - Australian Dollar", symbol: "A$" },
  { value: "CAD", label: "CAD - Canadian Dollar", symbol: "C$" },
  { value: "CNY", label: "CNY - Chinese Yuan", symbol: "¥" },
] as const;

export type Currency = typeof CURRENCIES[number]["value"];
