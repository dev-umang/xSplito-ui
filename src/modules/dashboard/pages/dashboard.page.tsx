import { type FC } from "react";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, FolderOpen, DollarSign } from "lucide-react";
import { ROUTES, getGroupDetailRoute } from "@/configs/navigation/navigation.constants";
import { useListenGroups } from "@/modules/groups/hooks/useListenGroups";
import { useGroups, useGroupsLoading } from "@/modules/groups/store/groups.store";
import { useListenFriends } from "@/modules/friends/hooks/useListenFriends";
import { useFriends, useReceivedRequests } from "@/modules/friends/store/friends.store";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { useUserDetails } from "@/modules/auth/store/user.store";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const userDetails = useUserDetails();

  // Start listeners
  useListenGroups();
  useListenFriends();

  const groups = useGroups();
  const loading = useGroupsLoading();
  const friends = useFriends();
  const receivedRequests = useReceivedRequests();

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-4 space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">
          Welcome back, {userDetails?.displayName?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your expense groups
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groups</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground">
              Active expense groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Friends</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{friends.length}</div>
            <p className="text-xs text-muted-foreground">
              {receivedRequests.length > 0 && `${receivedRequests.length} pending request${receivedRequests.length !== 1 ? "s" : ""}`}
              {receivedRequests.length === 0 && "Connected friends"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currency</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userDetails?.defaultCurrency || "USD"}</div>
            <p className="text-xs text-muted-foreground">
              Your default currency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Friend Requests Alert */}
      {receivedRequests.length > 0 && (
        <Card className="border-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-base">
              You have {receivedRequests.length} pending friend request{receivedRequests.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(ROUTES.FRIENDS)} variant="outline">
              View Requests
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(ROUTES.CREATE_GROUP)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Group
            </CardTitle>
            <CardDescription>
              Start a new expense group for a trip, shared apartment, or project
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(ROUTES.ADD_FRIEND)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Friend
            </CardTitle>
            <CardDescription>
              Connect with friends to split expenses together
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* My Groups */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Groups</CardTitle>
              <CardDescription>
                {groups.length === 0 ? "No groups yet" : `${groups.length} active group${groups.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </div>
            {groups.length > 0 && (
              <Button variant="outline" onClick={() => navigate(ROUTES.GROUPS)}>
                View All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first group to start tracking expenses
              </p>
              <Button onClick={() => navigate(ROUTES.CREATE_GROUP)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.slice(0, 5).map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(getGroupDetailRoute(group.id))}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 3).map((member) => (
                        <Avatar
                          key={member.userId}
                          className="border-2 border-background h-10 w-10"
                        >
                          <AvatarImage src={member.photoURL} />
                          <AvatarFallback className="text-xs">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {group.members.length > 3 && (
                        <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs font-medium">
                            +{group.members.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{group.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{group.currency}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
