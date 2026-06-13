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
import { SplitSelector } from "./split-selector";

interface Member {
  role: string;
  user: { id: string; name: string; email: string };
}

interface ExpenseFormDialogProps {
  groupId: string;
  members: Member[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseSaved: () => void;
  editExpense?: any | null;
}

export function ExpenseFormDialog({
  groupId,
  members,
  open,
  onOpenChange,
  onExpenseSaved,
  editExpense,
}: ExpenseFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [paidByUserId, setPaidByUserId] = useState("");
  const [splitMethod, setSplitMethod] = useState<
    "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARES"
  >("EQUAL");
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editExpense) {
        setTitle(editExpense.title);
        setDescription(editExpense.description || "");
        setAmountStr((editExpense.totalAmount / 100).toString());
        setPaidByUserId(editExpense.paidByUserId);
        setSplitMethod(editExpense.splitMethod);
      } else {
        setTitle("");
        setDescription("");
        setAmountStr("");
        setPaidByUserId(members[0]?.user.id || "");
        setSplitMethod("EQUAL");
      }
      setError(null);
    }
  }, [open, editExpense, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amountVal = Math.round(Number.parseFloat(amountStr) * 100);
    if (!amountVal || amountVal <= 0)
      return setError("Please enter a positive amount");
    if (participants.length === 0)
      return setError("Please select at least one participant");

    // Pre-validation for client experience
    if (splitMethod === "UNEQUAL") {
      const sum = participants.reduce((s, p) => s + (p.owedAmount || 0), 0);
      if (sum !== amountVal)
        return setError(
          `Sum of splits (₹${(sum / 100).toFixed(2)}) must equal total (₹${(amountVal / 100).toFixed(2)})`,
        );
    } else if (splitMethod === "PERCENTAGE") {
      const sum = participants.reduce((s, p) => s + (p.percentage || 0), 0);
      if (Math.abs(sum - 100) > 0.01)
        return setError(`Sum of percentages (${sum}%) must equal 100%`);
    }

    setLoading(true);
    const payload = {
      title,
      description,
      totalAmount: amountVal,
      groupId,
      paidByUserId,
      splitMethod,
      participants,
    };
    try {
      if (editExpense) {
        await api.updateExpense(editExpense.id, payload);
      } else {
        await api.createExpense(payload);
      }
      onExpenseSaved();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {editExpense ? "Edit Expense" : "Add Expense"}
          </DialogTitle>
          <DialogDescription>
            Record and split costs with group members.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          {error && (
            <div className="text-xs bg-destructive/10 text-destructive p-2 rounded">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Dinner, cab..."
              />
            </div>
            <div className="space-y-1">
              <Label>Total Amount (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Paid By</Label>
              <Select value={paidByUserId} onValueChange={setPaidByUserId}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.user.id} value={m.user.id}>
                      {m.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Split Method</Label>
              <Select
                value={splitMethod}
                onValueChange={(val: any) => setSplitMethod(val)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EQUAL">Equally</SelectItem>
                  <SelectItem value="UNEQUAL">Unequally (Exact)</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentages</SelectItem>
                  <SelectItem value="SHARES">Share Weights</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SplitSelector
            totalAmount={Math.round(Number.parseFloat(amountStr) * 100) || 0}
            splitMethod={splitMethod}
            members={members}
            initialParticipants={editExpense?.participants}
            onChange={setParticipants}
          />
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
            >
              {loading ? "Saving..." : "Save Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
