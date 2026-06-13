"use client";

import { ChevronRight } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Debt {
  fromUser: { id: string; name: string };
  toUser: { id: string; name: string };
  amount: number;
}

interface SettleUpPanelProps {
  debts: Debt[];
  currentUserId: string;
  onRemind?: (debt: Debt) => void;
}

function getInitials(name: string | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SettleUpPanel({
  debts,
  currentUserId,
  onRemind,
}: SettleUpPanelProps) {
  if (debts.length === 0) return null;

  const fmt = (amount: number) =>
    `₹${(amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-base">Settle Up</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quickly settle balances with your friends
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {debts.slice(0, 4).map((debt, idx) => {
          const isCurrentOwer = debt.fromUser.id === currentUserId;
          const name = isCurrentOwer ? debt.toUser.name : debt.fromUser.name;
          const label = isCurrentOwer ? "you owe" : "owes you";
          const labelColor = isCurrentOwer
            ? "text-rose-500"
            : "text-emerald-500";

          return (
            <div
              key={`${debt.fromUser.id}-${debt.toUser.id}-${idx}`}
              className="flex items-center gap-3"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{name}</p>
                <p className={`text-xs ${labelColor}`}>{label}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold">{fmt(debt.amount)}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-xs font-semibold border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => onRemind?.(debt)}
                >
                  {isCurrentOwer ? "Settle" : "Remind"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {debts.length > 4 && (
        <button
          type="button"
          className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          View All Settlements <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
