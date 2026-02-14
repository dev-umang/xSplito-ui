import { format } from "date-fns";
import { Trash2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Settlement } from "../types/settlements.types";
import { useDeleteSettlement } from "../hooks/useSettlementActions";
import { useAuthUser } from "@/modules/auth/store/auth.store";

type SettlementListProps = {
  settlements: Settlement[];
};

const SettlementList = ({ settlements }: SettlementListProps) => {
  const authUser = useAuthUser();
  const { deleteSettlement, loading } = useDeleteSettlement();

  const sortedSettlements = [...settlements].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const handleDelete = async (settlementId: string) => {
    await deleteSettlement(settlementId);
  };

  if (settlements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No settlements recorded yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Click "Settle Up" to record a payment between members
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedSettlements.map((settlement) => {
        const canDelete = authUser?.uid === settlement.createdBy;

        return (
          <Card key={settlement.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* From User */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={settlement.fromUser.userPhoto || ""} />
                    <AvatarFallback>
                      {settlement.fromUser.userName
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex items-center gap-2 flex-1">
                    <div>
                      <p className="font-medium text-sm">
                        {settlement.fromUser.userName}
                      </p>
                      <p className="text-xs text-muted-foreground">paid</p>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />

                    <Avatar className="h-10 w-10">
                      <AvatarImage src={settlement.toUser.userPhoto || ""} />
                      <AvatarFallback>
                        {settlement.toUser.userName
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium text-sm">
                        {settlement.toUser.userName}
                      </p>
                      <p className="text-xs text-muted-foreground">received</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {settlement.currency} {settlement.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(settlement.date, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {canDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Settlement?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove this settlement record. Balances will
                          be recalculated. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(settlement.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              {settlement.notes && (
                <p className="text-sm text-muted-foreground mt-2 ml-13">
                  {settlement.notes}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SettlementList;
