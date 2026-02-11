import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Users, Check, X } from "lucide-react";
import { ROUTES } from "@/configs/navigation/navigation.constants";
import { useListenFriends } from "../hooks/useListenFriends";
import {
  useFriends,
  useReceivedRequests,
  useSentRequests,
  useFriendsLoading,
} from "../store/friends.store";
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
} from "../hooks/useFriendActions";
import { useAuthUser } from "@/modules/auth/store/auth.store";

export const FriendsPage = () => {
  const navigate = useNavigate();
  const authUser = useAuthUser();
  useListenFriends(); // Start listening to friends and requests

  const friends = useFriends();
  const receivedRequests = useReceivedRequests();
  const sentRequests = useSentRequests();
  const loading = useFriendsLoading();

  const { acceptRequest } = useAcceptFriendRequest();
  const { rejectRequest } = useRejectFriendRequest();
  const { removeFriend } = useRemoveFriend();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getFriendDetails = (friendship: { users: string[]; userDetails: Record<string, { name: string; email: string; photoURL?: string }> }) => {
    const friendId = friendship.users.find((id: string) => id !== authUser?.uid);
    return friendId ? friendship.userDetails[friendId] : null;
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Friends
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your friends and connections
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.ADD_FRIEND)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      </div>

      {/* Pending Received Requests */}
      {receivedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Friend Requests
              <Badge variant="secondary">{receivedRequests.length}</Badge>
            </CardTitle>
            <CardDescription>
              People who want to connect with you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {receivedRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={request.fromUserPhoto} />
                    <AvatarFallback>
                      {getInitials(request.fromUserName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.fromUserName}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.fromUserEmail}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() =>
                      acceptRequest(
                        request.id,
                        request.fromUserId,
                        request.fromUserName,
                        request.fromUserEmail,
                        request.fromUserPhoto
                      )
                    }
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectRequest(request.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sent Requests
              <Badge variant="outline">{sentRequests.length}</Badge>
            </CardTitle>
            <CardDescription>Waiting for acceptance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(request.toUserName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.toUserName}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.toUserEmail}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            My Friends
            <Badge variant="secondary">{friends.length}</Badge>
          </CardTitle>
          <CardDescription>
            {friends.length === 0
              ? "You haven't added any friends yet"
              : "Your connections on xSplito"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Start by adding friends to split expenses together!
              </p>
              <Button onClick={() => navigate(ROUTES.ADD_FRIEND)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Friend
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friendship) => {
                const friend = getFriendDetails(friendship);
                return (
                  <div
                    key={friendship.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.photoURL} />
                        <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{friend.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {friend.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeFriend(friendship.id, friend.name)}
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendsPage;
