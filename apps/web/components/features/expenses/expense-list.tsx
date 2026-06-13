"use client";

import { Edit2, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

interface ExpenseParticipant {
  userId: string;
  owedAmount: number;
}

interface Expense {
  id: string;
  title: string;
  description?: string | null;
  totalAmount: number;
  paidByUserId: string;
  paidBy: { name: string };
  createdAt: string;
  participants: ExpenseParticipant[];
}

interface ExpenseListProps {
  groupId: string;
  expenses: Expense[];
  currentUserId: string;
  groupCreatorId: string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({
  groupId,
  expenses,
  currentUserId,
  groupCreatorId,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl bg-card">
        No expenses recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const isPayer = expense.paidByUserId === currentUserId;
        const myParticipant = expense.participants.find(
          (p) => p.userId === currentUserId,
        );
        const myOwedAmount = myParticipant?.owedAmount || 0;

        let statusText = "";
        let statusClass = "text-muted-foreground";

        if (isPayer) {
          const othersOwed = expense.totalAmount - myOwedAmount;
          statusText =
            othersOwed > 0
              ? `You lent ${formatCurrency(othersOwed)}`
              : "You paid for yourself";
          statusClass = "text-emerald-600 dark:text-emerald-400 font-medium";
        } else if (myParticipant) {
          statusText = `You owe ${formatCurrency(myOwedAmount)}`;
          statusClass = "text-rose-600 dark:text-rose-400 font-medium";
        } else {
          statusText = "Not involved";
        }

        return (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:shadow-sm transition-all"
          >
            <Link
              href={`/dashboard/groups/${groupId}/expenses/${expense.id}`}
              className="flex-1 min-w-0"
            >
              <div className="font-bold truncate text-foreground hover:text-primary transition-colors">
                {expense.title}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Paid by{" "}
                <span className="font-semibold">{expense.paidBy.name}</span> •{" "}
                {new Date(expense.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </Link>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="text-sm font-bold">
                  {formatCurrency(expense.totalAmount)}
                </div>
                <div className={`text-xs ${statusClass}`}>{statusText}</div>
              </div>

              <div className="flex items-center gap-1">
                <Link
                  href={`/dashboard/groups/${groupId}/expenses/${expense.id}`}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </Link>
                {currentUserId === groupCreatorId && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(expense)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(expense.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
