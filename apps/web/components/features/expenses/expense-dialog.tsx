"use client";

import { useEffect, useState } from "react";
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
  user: { id: string; name: string };
}

interface Expense {
  id: string;
  title: string;
  description: string | null;
  totalAmount: number;
  paidByUserId: string;
  splitMethod: "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARES";
  participants: {
    userId: string;
    owedAmount: number;
    percentage: number | null;
    shares: number | null;
  }[];
}

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: Member[];
  expenseToEdit?: Expense | null;
  onSuccess: () => void;
}

export function ExpenseDialog({
  open,
  onOpenChange,
  groupId,
  members,
  expenseToEdit,
  onSuccess,
}: ExpenseDialogProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [splitMethod, setSplitMethod] = useState<
    "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARES"
  >("EQUAL");
  const [selectedParticipants, setSelectedParticipants] = useState<
    Record<string, boolean>
  >({});
  const [splitValues, setSplitValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setDesc(expenseToEdit.description || "");
      setAmount(expenseToEdit.totalAmount.toString());
      setPayerId(expenseToEdit.paidByUserId);
      setSplitMethod(expenseToEdit.splitMethod);
      const parts: Record<string, boolean> = {};
      const vals: Record<string, string> = {};
      for (const p of expenseToEdit.participants) {
        parts[p.userId] = true;
        if (expenseToEdit.splitMethod === "UNEQUAL")
          vals[p.userId] = p.owedAmount.toString();
        else if (expenseToEdit.splitMethod === "PERCENTAGE")
          vals[p.userId] = (p.percentage || 0).toString();
        else if (expenseToEdit.splitMethod === "SHARES")
          vals[p.userId] = (p.shares || 1).toString();
      }
      setSelectedParticipants(parts);
      setSplitValues(vals);
    } else {
      setTitle("");
      setDesc("");
      setAmount("");
      setPayerId(members[0]?.userId || "");
      setSplitMethod("EQUAL");
      const initialParts: Record<string, boolean> = {};
      for (const m of members) initialParts[m.userId] = true;
      setSelectedParticipants(initialParts);
      setSplitValues({});
    }
  }, [expenseToEdit, open, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const intAmount = Math.round(Number.parseFloat(amount));
    if (!title) return toast.error("Title is required");
    if (Number.isNaN(intAmount) || intAmount <= 0)
      return toast.error("Total amount must be a positive number");

    const participantsList = Object.keys(selectedParticipants).filter(
      (uid) => selectedParticipants[uid],
    );
    if (participantsList.length === 0)
      return toast.error("Select at least one participant");

    const participantsBody = participantsList.map((uid) => {
      const valStr = splitValues[uid] || "0";
      const valNum = Number.parseFloat(valStr) || 0;
      return {
        userId: uid,
        owedAmount: splitMethod === "UNEQUAL" ? Math.round(valNum) : undefined,
        percentage: splitMethod === "PERCENTAGE" ? valNum : undefined,
        shares: splitMethod === "SHARES" ? Math.round(valNum) : undefined,
      };
    });

    setLoading(true);
    try {
      const url = expenseToEdit ? `/expenses/${expenseToEdit.id}` : "/expenses";
      const method = expenseToEdit ? "PUT" : "POST";
      await fetchApi(url, {
        method,
        body: JSON.stringify({
          title: title.trim(),
          description: desc.trim() || null,
          totalAmount: intAmount,
          groupId,
          paidByUserId: payerId,
          splitMethod,
          participants: participantsBody,
        }),
      });
      toast.success(expenseToEdit ? "Expense updated!" : "Expense added!");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {expenseToEdit ? "Edit Expense" : "Add Expense"}
          </DialogTitle>
          <DialogDescription>
            Input title, amount, payer and how to split the cost.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="etitle">Title</Label>
              <Input
                id="etitle"
                placeholder="Dinner, Cab..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="eamount">Total Amount (₹)</Label>
              <Input
                id="eamount"
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="epayer">Paid By</Label>
              <Select
                value={payerId}
                onValueChange={setPayerId}
                disabled={loading}
              >
                <SelectTrigger id="epayer" className="border-border bg-card">
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="esplit">Split Method</Label>
              <Select
                value={splitMethod}
                onValueChange={(v: any) => setSplitMethod(v)}
                disabled={loading}
              >
                <SelectTrigger id="esplit" className="border-border bg-card">
                  <SelectValue placeholder="Select split method" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="EQUAL">Split Equally</SelectItem>
                  <SelectItem value="UNEQUAL">Exact Amount</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="SHARES">Shares/Weights</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Participants</Label>
            <div className="space-y-2 border border-border rounded-xl p-3 bg-muted/20 max-h-40 overflow-y-auto">
              {members.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`check-${m.userId}`}
                      checked={selectedParticipants[m.userId] || false}
                      onChange={(e) =>
                        setSelectedParticipants({
                          ...selectedParticipants,
                          [m.userId]: e.target.checked,
                        })
                      }
                      disabled={loading}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                    <label
                      htmlFor={`check-${m.userId}`}
                      className="font-medium cursor-pointer"
                    >
                      {m.user.name}
                    </label>
                  </div>
                  {selectedParticipants[m.userId] &&
                    splitMethod !== "EQUAL" && (
                      <Input
                        className="w-24 h-8 text-xs border-border"
                        type="number"
                        placeholder={
                          splitMethod === "UNEQUAL"
                            ? "₹"
                            : splitMethod === "PERCENTAGE"
                              ? "%"
                              : "shares"
                        }
                        value={splitValues[m.userId] || ""}
                        onChange={(e) =>
                          setSplitValues({
                            ...splitValues,
                            [m.userId]: e.target.value,
                          })
                        }
                        disabled={loading}
                        required
                      />
                    )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer"
            >
              {loading ? "Saving..." : "Save Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
