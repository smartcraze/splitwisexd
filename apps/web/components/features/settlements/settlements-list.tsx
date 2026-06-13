"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";

interface Settlement {
  id: string;
  amount: number;
  note?: string | null;
  createdAt: string;
  paidBy: { name: string };
  paidTo: { name: string };
}

interface SettlementsListProps {
  settlements: Settlement[];
}

export function SettlementsList({ settlements }: SettlementsListProps) {
  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  if (settlements.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-xl bg-card">
        No settlements recorded.
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
      {settlements.map((settlement) => (
        <div
          key={settlement.id}
          className="flex items-center justify-between p-3.5 bg-card rounded-xl border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold flex items-center flex-wrap gap-1.5">
                <span className="text-foreground">
                  {settlement.paidBy.name}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-foreground">
                  {settlement.paidTo.name}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {new Date(settlement.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {settlement.note && ` • "${settlement.note}"`}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(settlement.amount)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
