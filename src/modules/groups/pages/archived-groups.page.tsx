import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  ChevronRight,
  Archive,
  Search,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Trash2,
  Loader2,
  ArchiveRestore,
  ArrowLeft,
} from "lucide-react";
import {
  ROUTES,
  getGroupDetailRoute,
} from "@/configs/navigation/navigation.constants";
import { useListenGroups } from "../hooks/useListenGroups";
import { useArchivedGroups, useGroupsLoading } from "../store/groups.store";
import { useAuthUser } from "@/modules/auth/store/auth.store";
import { useExpensesStore } from "@/modules/expenses/store/expenses.store";
import { calculateGroupBalances, getUserDebts } from "@/modules/balances/utils/balance.utils";
import { useSettlementsStore } from "@/modules/settlements/store/settlements.store";
import { useDeleteGroup, useUnarchiveGroup } from "../hooks/useGroupActions";
import type { Group } from "../types/groups.types";

export const ArchivedGroupsPage = () => {
  const navigate = useNavigate();
  const authUser = useAuthUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { deleteGroup } = useDeleteGroup();
  const { unarchiveGroup } = useUnarchiveGroup();

  useListenGroups(); // Start listening to groups

  const archivedGroups = useArchivedGroups();
  const loading = useGroupsLoading();
  const expensesStore = useExpensesStore();
  const settlementsStore = useSettlementsStore();

  // Calculate user's net balance for each group
  const groupBalances = useMemo(() => {
    if (!authUser) return {};

    const balances: Record<string, number> = {};
    archivedGroups.forEach((group) => {
      const expenses = expensesStore.groupExpenses[group.id] || [];
      const settlements = settlementsStore.settlements.filter(
        (s) => s.groupId === group.id
      );
      const members = group.members.map((m) => ({
        userId: m.userId,
        name: m.name,
        email: m.email,
        photoURL: m.photoURL || undefined,
      }));
      const groupBalances = calculateGroupBalances(
        group.id,
        expenses,
        settlements,
        members
      );

      const userDebts = getUserDebts(authUser.uid, groupBalances.simplifiedDebts);

      // Calculate net balance: what I'm owed minus what I owe
      const owed = userDebts.owed.reduce((sum, debt) => sum + debt.amount, 0);
      const owes = userDebts.owes.reduce((sum, debt) => sum + debt.amount, 0);
      const netBalance = owed - owes;

      balances[group.id] = netBalance;
    });

    return balances;
  }, [archivedGroups, expensesStore.groupExpenses, settlementsStore.settlements, authUser]);

  // Filter groups based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return archivedGroups;

    const query = searchQuery.toLowerCase();
    return archivedGroups.filter((group) => {
      return (
        group.name.toLowerCase().includes(query) ||
        group.description?.toLowerCase().includes(query) ||
        group.members.some((member) => member.name.toLowerCase().includes(query))
      );
    });
  }, [archivedGroups, searchQuery]);

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

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    setActionLoading(true);
    const result = await deleteGroup(selectedGroup.id, selectedGroup.name);
    setActionLoading(false);

    if (result.success) {
      setDeleteConfirmOpen(false);
      setSelectedGroup(null);
    }
  };

  const handleUnarchiveGroup = async (group: Group) => {
    setActionLoading(true);
    await unarchiveGroup(group.id, group.name);
    setActionLoading(false);
  };

  const isAdmin = (group: Group) => {
    return (
      group.members.find((m) => m.userId === authUser?.uid)?.role === "admin"
    );
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
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(ROUTES.GROUPS)}
          className="mt-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Archive className="h-8 w-8" />
                Archived Groups
              </h1>
              <p className="text-muted-foreground mt-1">
                Groups you've archived can be restored at any time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {archivedGroups.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search archived groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Groups Grid */}
      {archivedGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Archive className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No archived groups</h3>
              <p className="text-muted-foreground mb-6">
                Groups you archive will appear here
              </p>
              <Button onClick={() => navigate(ROUTES.GROUPS)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Groups
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search query
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => {
            const balance = groupBalances[group.id] || 0;
            const hasBalance = Math.abs(balance) > 0.01;
            const isOwed = balance > 0;
            const userIsAdmin = isAdmin(group);

            return (
              <Card
                key={group.id}
                className="hover:shadow-lg transition-shadow group relative"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => navigate(getGroupDetailRoute(group.id))}
                    >
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
                    {userIsAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnarchiveGroup(group);
                            }}
                            disabled={actionLoading}
                          >
                            <ArchiveRestore className="h-4 w-4 mr-2" />
                            Unarchive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGroup(group);
                              setDeleteConfirmOpen(true);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent
                  className="space-y-4 cursor-pointer"
                  onClick={() => navigate(getGroupDetailRoute(group.id))}
                >
                  {/* Badges Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {hasBalance && (
                      <Badge
                        variant={isOwed ? "default" : "destructive"}
                        className={
                          isOwed
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-orange-500 hover:bg-orange-600"
                        }
                      >
                        {isOwed ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {isOwed ? "+" : ""}
                        {getCurrencySymbol(group.currency)}
                        {Math.abs(balance).toFixed(2)}
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {getCurrencySymbol(group.currency)} {group.currency}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-orange-500 text-orange-500"
                    >
                      <Archive className="h-3 w-3 mr-1" />
                      Archived
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

                  {/* Archived Date */}
                  {group.archivedAt && (
                    <div className="text-xs text-muted-foreground">
                      Archived on {new Date(group.archivedAt).toLocaleDateString()}
                    </div>
                  )}

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
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{selectedGroup?.name}"?
              This action cannot be undone. All expenses and data associated with
              this group will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArchivedGroupsPage;
