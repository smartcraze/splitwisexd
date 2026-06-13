"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
import { api } from "@/lib/api";

interface Member {
  user: { id: string; name: string };
}

interface SettleUpDialogProps {
  groupId: string;
  members: Member[];
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettlementSaved: () => void;
  prefill?: { paidToUserId: string; amount: number } | null;
}

export function SettleUpDialog({
  groupId,
  members,
  currentUserId,
  open,
  onOpenChange,
  onSettlementSaved,
  prefill,
}: SettleUpDialogProps) {
  const [paidToUserId, setPaidToUserId] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eligibleRecipients = members.filter((m) => m.user.id !== currentUserId);

  useEffect(() => {
    if (open) {
      if (prefill) {
        setPaidToUserId(prefill.paidToUserId);
        setAmountStr((prefill.amount / 100).toString());
      } else {
        setPaidToUserId(eligibleRecipients[0]?.user.id || "");
        setAmountStr("");
      }
      setNote("");
      setError(null);
    }
  }, [open, prefill, eligibleRecipients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amountVal = Math.round(Number.parseFloat(amountStr) * 100);
    if (!amountVal || amountVal <= 0) {
      return setError("Please enter a positive amount");
    }
    if (!paidToUserId) {
      return setError("Please select a recipient");
    }

    setLoading(true);
    try {
      await api.createSettlement({
        groupId,
        paidToUserId,
        amount: amountVal,
        note: note.trim() || undefined,
      });
      onSettlementSaved();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to record settlement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Record Settlement</DialogTitle>
          <DialogDescription>
            Log a payment you made directly to another member to settle your
            debts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="text-xs bg-destructive/10 text-destructive p-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="recipient">Who did you pay?</Label>
            <Select value={paidToUserId} onValueChange={setPaidToUserId}>
              <SelectTrigger
                id="recipient"
                className="bg-background border-border"
              >
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {eligibleRecipients.map((m) => (
                  <SelectItem key={m.user.id} value={m.user.id}>
                    {m.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="amount">Amount Paid (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              required
              disabled={loading}
              className="bg-background border-border text-foreground focus:ring-ring focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="settlement-note">Note / Description</Label>
            <Input
              id="settlement-note"
              placeholder="Cash, GPay, etc. (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              className="bg-background border-border text-foreground focus:ring-ring focus:border-primary"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
            >
              {loading ? "Recording..." : "Record Settlement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
