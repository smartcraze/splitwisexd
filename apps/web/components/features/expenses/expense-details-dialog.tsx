"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CommentsSection } from "./comments-section";

interface Participant {
  userId: string;
  owedAmount: number;
  percentage: number | null;
  shares: number | null;
  user: {
    name: string;
    avatarUrl: string | null;
  };
}

interface Expense {
  id: string;
  title: string;
  description: string | null;
  totalAmount: number;
  createdAt: string;
  splitMethod: "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARES";
  paidBy: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  participants: Participant[];
}

interface ExpenseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  currentUserId: string;
}

export function ExpenseDetailsDialog({
  open,
  onOpenChange,
  expense,
  currentUserId,
}: ExpenseDetailsDialogProps) {
  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {expense.title}
          </DialogTitle>
          <DialogDescription>
            Created on{" "}
            {new Date(expense.createdAt).toLocaleDateString(undefined, {
              dateStyle: "long",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-2">
          {/* Splits info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-xl">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={expense.paidBy.avatarUrl || undefined} />
                <AvatarFallback>
                  {expense.paidBy.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Paid By</span>
                <span className="text-sm font-bold">{expense.paidBy.name}</span>
                <span className="text-base font-extrabold text-primary">
                  ₹{expense.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Split Breakdown ({expense.splitMethod})
              </h4>
              <div className="border border-border rounded-xl bg-card divide-y divide-border overflow-hidden max-h-48 overflow-y-auto">
                {expense.participants.map((p) => (
                  <div
                    key={p.userId}
                    className="flex justify-between items-center p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={p.user.avatarUrl || undefined} />
                        <AvatarFallback>
                          {p.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{p.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      {p.percentage && (
                        <span className="text-muted-foreground">
                          ({p.percentage}%)
                        </span>
                      )}
                      {p.shares && (
                        <span className="text-muted-foreground">
                          ({p.shares} sh)
                        </span>
                      )}
                      <span className="font-bold">
                        ₹{p.owedAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comments section */}
          <CommentsSection
            expenseId={expense.id}
            currentUserId={currentUserId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
