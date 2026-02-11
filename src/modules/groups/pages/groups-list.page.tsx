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
import { Plus, Users, ChevronRight, FolderOpen } from "lucide-react";
import {
  ROUTES,
  getGroupDetailRoute,
} from "@/configs/navigation/navigation.constants";
import { useListenGroups } from "../hooks/useListenGroups";
import { useGroups, useGroupsLoading } from "../store/groups.store";

export const GroupsListPage = () => {
  const navigate = useNavigate();
  useListenGroups(); // Start listening to groups

  const groups = useGroups();
  const loading = useGroupsLoading();

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      JPY: "¥",
      AUD: "A$",
      CAD: "C$",
      CNY: "¥",
    };
    return symbols[currency] || currency;
  };

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderOpen className="h-8 w-8" />
            Groups
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your expense groups and trips
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.CREATE_GROUP)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
              <p className="text-muted-foreground mb-6">
                Create a group to start splitting expenses with friends
              </p>
              <Button onClick={() => navigate(ROUTES.CREATE_GROUP)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Group
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(getGroupDetailRoute(group.id))}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                      {group.name}
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                    {group.description && (
                      <CardDescription className="mt-2 line-clamp-2">
                        {group.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Currency Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {getCurrencySymbol(group.currency)} {group.currency}
                  </Badge>
                </div>

                {/* Members */}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {group.members.length} member
                    {group.members.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Member Avatars */}
                <div className="flex -space-x-2">
                  {group.members.slice(0, 5).map((member) => (
                    <Avatar
                      key={member.userId}
                      className="border-2 border-background h-8 w-8"
                    >
                      <AvatarImage src={member.photoURL || ""} />
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
                  {group.members.length > 5 && (
                    <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs font-medium">
                        +{group.members.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsListPage;
