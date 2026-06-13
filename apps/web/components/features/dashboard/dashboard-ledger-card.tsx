"use client";

import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface DashboardLedgerCardProps {
  totalBalance: number;
  youOwe: number;
  youAreOwed: number;
  groupsCount: number;
  peopleCount: number;
  settledPercentage: number;
  onAddExpense: () => void;
}

export function DashboardLedgerCard({
  totalBalance,
  youOwe,
  youAreOwed,
  groupsCount,
  peopleCount,
  settledPercentage,
  onAddExpense,
}: DashboardLedgerCardProps) {
  const isOwed = totalBalance >= 0;

  return (
    <div className="bg-[var(--summary-bg)] text-[var(--summary-fg)] rounded-[32px] p-6 shadow-2xl border border-[var(--summary-border)] space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header Metric */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">
              Total balance
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight">
              ₹{Math.abs(totalBalance).toLocaleString()}
            </h2>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isOwed ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}
          >
            {isOwed ? "You are owed" : "You owe"}
          </span>
        </div>

        {/* Sub-cards Grid: You owe / Owed to you */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--summary-card-bg)] border border-[var(--summary-card-border)] rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              <IconArrowDownLeft size={12} className="text-rose-400" /> You owe
            </div>
            <span className="text-lg font-extrabold text-[var(--summary-fg)]">
              ₹{youOwe.toLocaleString()}
            </span>
          </div>
          <div className="bg-[var(--summary-card-bg)] border border-[var(--summary-card-border)] rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              <IconArrowUpRight size={12} className="text-emerald-400" /> Owed
              to you
            </div>
            <span className="text-lg font-extrabold text-[var(--summary-fg)]">
              ₹{youAreOwed.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Stats Columns Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[var(--summary-stat-bg)] border border-[var(--summary-border)] rounded-xl py-3 px-1 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Groups
            </span>
            <span className="text-base font-extrabold">{groupsCount}</span>
          </div>
          <div className="bg-[var(--summary-stat-bg)] border border-[var(--summary-border)] rounded-xl py-3 px-1 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              People
            </span>
            <span className="text-base font-extrabold">{peopleCount}</span>
          </div>
          <div className="bg-[var(--summary-stat-bg)] border border-[var(--summary-border)] rounded-xl py-3 px-1 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Settled
            </span>
            <span className="text-base font-extrabold text-emerald-400">
              {settledPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* White Add Expense Button */}
      <Button
        onClick={onAddExpense}
        className="w-full bg-[var(--summary-btn-bg)] hover:bg-[var(--summary-btn-hover-bg)] text-[var(--summary-btn-fg)] font-bold h-12 rounded-2xl cursor-pointer flex items-center justify-center gap-2 shadow-lg border-0"
      >
        <IconPlus size={16} /> Add expense
      </Button>
    </div>
  );
}
