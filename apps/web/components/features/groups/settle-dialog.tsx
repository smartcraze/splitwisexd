"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchApi } from "@/lib/api";

interface Member {
  userId: string;
  user: {
    id: string;
    name: string;
  };
}

interface SettleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: Member[];
  currentUserId: string;
  onSuccess: () => void;
}

export function SettleDialog({
  open,
  onOpenChange,
  groupId,
  members,
  currentUserId,
  onSuccess,
}: SettleDialogProps) {
  const [paidToUserId, setPaidToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const eligibleRecipients = members.filter((m) => m.userId !== currentUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paidToUserId) return toast.error("Please select a recipient");
    const intAmount = Math.round(Number.parseFloat(amount));
    if (Number.isNaN(intAmount) || intAmount <= 0)
      return toast.error("Amount must be a positive number");

    setLoading(true);
    try {
      await fetchApi("/settlements", {
        method: "POST",
        body: JSON.stringify({
          groupId,
          paidToUserId,
          amount: intAmount,
          note: note.trim() || null,
        }),
      });
      toast.success("Payment recorded successfully!");
      setPaidToUserId("");
      setAmount("");
      setNote("");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Record a Payment</DialogTitle>
          <DialogDescription>
            Settle outstanding debts in this group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="recipient">Who did you pay?</Label>
            <Select
              value={paidToUserId}
              onValueChange={setPaidToUserId}
              disabled={loading}
            >
              <SelectTrigger id="recipient" className="w-full border-border">
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {eligibleRecipients.map((m) => (
                  <SelectItem
                    key={m.userId}
                    value={m.userId}
                    className="cursor-pointer"
                  >
                    {m.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              placeholder="e.g. GPay, cash, dinner payback"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
            />
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer"
            >
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
