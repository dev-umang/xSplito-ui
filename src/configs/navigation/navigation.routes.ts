import AuthLayout from "@/layouts/auth.layout";
import GlobalLayout from "@/layouts/global.layout";
import MainLayout from "@/layouts/main.layout";
import SplashPage from "@/modules/splash/pages/splash.page";
import { lazy } from "react";
// import LoginPage from "@/modules/auth/pages/login.page";
import type { RouteObject } from "react-router-dom";
import { navigationUtils } from "./navigation.utils";

const LoginPage = lazy(() => import("@/modules/auth/pages/login.page"));
const ProfileSetupPage = lazy(
  () => import("@/modules/auth/pages/profile-setup.page")
);
const DashboardPage = lazy(
  () => import("@/modules/dashboard/pages/dashboard.page")
);
const FriendsPage = lazy(() => import("@/modules/friends/pages/friends.page"));
const AddFriendPage = lazy(
  () => import("@/modules/friends/pages/add-friend.page")
);
const GroupsListPage = lazy(
  () => import("@/modules/groups/pages/groups-list.page")
);
const ArchivedGroupsPage = lazy(
  () => import("@/modules/groups/pages/archived-groups.page")
);
const CreateGroupPage = lazy(
  () => import("@/modules/groups/pages/create-group.page")
);
const GroupDetailPage = lazy(
  () => import("@/modules/groups/pages/group-detail.page")
);
const AddExpensePage = lazy(
  () => import("@/modules/expenses/pages/add-expense.page")
);
const ActivityPage = lazy(
  () => import("@/modules/activity/pages/activity.page")
);
const ProfilePage = lazy(
  () => import("@/modules/profile/pages/profile.page")
);
const EditProfilePage = lazy(
  () => import("@/modules/profile/pages/edit-profile.page")
);
const AddSettlementPage = lazy(
  () => import("@/modules/settlements/pages/add-settlement.page")
);
const MigratePage = lazy(
  () => import("@/modules/admin/pages/migrate.page")
);

const { route, layout } = navigationUtils;

export const NavigationRoutes: RouteObject[] = [
  layout(GlobalLayout, [
    route("ROOT", SplashPage),
    layout(AuthLayout, [
      route("LOGIN", LoginPage),
      route("PROFILE_SETUP", ProfileSetupPage),
    ]),
    layout(MainLayout, [
      route("DASHBOARD", DashboardPage),
      route("FRIENDS", FriendsPage),
      route("ADD_FRIEND", AddFriendPage),
      route("GROUPS", GroupsListPage),
      route("ARCHIVED_GROUPS", ArchivedGroupsPage),
      route("CREATE_GROUP", CreateGroupPage),
      route("GROUP_DETAIL", GroupDetailPage),
      route("ADD_EXPENSE", AddExpensePage),
      route("ACTIVITY", ActivityPage),
      route("PROFILE", ProfilePage),
      route("EDIT_PROFILE", EditProfilePage),
      route("ADD_SETTLEMENT", AddSettlementPage),
      route("MIGRATE", MigratePage), // Temporary migration
    ]),
  ]),
];
