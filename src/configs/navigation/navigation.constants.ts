export const ROUTES = {
  ROOT: "/",
  LOGIN: "/auth/login",
  PROFILE_SETUP: "/auth/setup-profile",
  DASHBOARD: "/dashboard",
  FRIENDS: "/friends",
  ADD_FRIEND: "/friends/add",
  GROUPS: "/groups",
  CREATE_GROUP: "/groups/create",
  GROUP_DETAIL: "/groups/:id",
  EDIT_GROUP: "/groups/:id/edit",
  ADD_EXPENSE: "/groups/:id/expense/add",
  EXPENSE_DETAIL: "/expenses/:id",
  EDIT_EXPENSE: "/expenses/:id/edit",
  ADD_SETTLEMENT: "/groups/:id/settlement/add",
  ACTIVITY: "/activity",
  PROFILE: "/profile",
  EDIT_PROFILE: "/profile/edit",
  SETTINGS: "/settings",
  ANALYTICS: "/analytics",
};

export type RouteKey = keyof typeof ROUTES;

// Dynamic route helpers
export const getGroupDetailRoute = (groupId: string) =>
  `/groups/${groupId}`;
export const getEditGroupRoute = (groupId: string) =>
  `/groups/${groupId}/edit`;
export const getAddExpenseRoute = (groupId: string) =>
  `/groups/${groupId}/expense/add`;
export const getExpenseDetailRoute = (expenseId: string) =>
  `/expenses/${expenseId}`;
export const getEditExpenseRoute = (expenseId: string) =>
  `/expenses/${expenseId}/edit`;
export const getAddSettlementRoute = (groupId: string) =>
  `/groups/${groupId}/settlement/add`;

