import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddSettlement } from "../hooks/useSettlementActions";
import type { Group } from "@/modules/groups/types/groups.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type SettleUpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
  defaultFromUserId?: string;
  defaultToUserId?: string;
  defaultAmount?: number;
};

const SettleUpDialog = ({
  open,
  onOpenChange,
  group,
  defaultFromUserId,
  defaultToUserId,
  defaultAmount,
}: SettleUpDialogProps) => {
  const { addSettlement, loading } = useAddSettlement();
  
  const [fromUserId, setFromUserId] = useState(defaultFromUserId || "");
  const [toUserId, setToUserId] = useState(defaultToUserId || "");
  const [amount, setAmount] = useState(defaultAmount?.toString() || "");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    if (!fromUserId || !toUserId || fromUserId === toUserId) {
      return;
    }

    const result = await addSettlement({
      groupId: group.id,
      fromUserId,
      toUserId,
      amount: amountNum,
      date: new Date(),
      notes,
    });

    if (result.success) {
      onOpenChange(false);
      setFromUserId("");
      setToUserId("");
      setAmount("");
      setNotes("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Record Settlement</DialogTitle>
          <DialogDescription>
            Record a payment between members in {group.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from">From (Payer)</Label>
            <Select value={fromUserId} onValueChange={setFromUserId}>
              <SelectTrigger id="from">
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
              <SelectContent>
                {group.members.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.photoURL || ""} />
                        <AvatarFallback className="text-xs">
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to">To (Receiver)</Label>
            <Select value={toUserId} onValueChange={setToUserId}>
              <SelectTrigger id="to">
                <SelectValue placeholder="Select who received" />
              </SelectTrigger>
              <SelectContent>
                {group.members.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.photoURL || ""} />
                        <AvatarFallback className="text-xs">
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount ({group.currency})
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SettleUpDialog;
