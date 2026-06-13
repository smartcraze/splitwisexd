"use client";

import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconPlus,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardSummaryProps {
  totalBalance: number;
  youOwe: number;
  youAreOwed: number;
  groupsCount: number;
  peopleCount: number;
  settledPercentage: number;
  onAddExpense: () => void;
}

export function DashboardSummary({
  totalBalance,
  youOwe,
  youAreOwed,
  groupsCount,
  peopleCount,
  settledPercentage,
  onAddExpense,
}: DashboardSummaryProps) {
  const isOwed = totalBalance >= 0;

  return (
    <div className="bg-[var(--summary-bg)] text-[var(--summary-fg)] rounded-[24px] p-6 shadow-xl border border-[var(--summary-border)] space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block font-sans">
              Total balance
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight font-sans">
              ₹
              {Math.abs(totalBalance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isOwed ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}
          >
            {isOwed ? "You are owed" : "You owe"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--summary-card-bg)] border border-[var(--summary-card-border)] rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              <IconArrowDownLeft size={12} className="text-rose-400" /> You owe
            </div>
            <span className="text-base font-extrabold text-[var(--summary-fg)]">
              ₹
              {youOwe.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="bg-[var(--summary-card-bg)] border border-[var(--summary-card-border)] rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              <IconArrowUpRight size={12} className="text-emerald-400" /> Owed
              to you
            </div>
            <span className="text-base font-extrabold text-[var(--summary-fg)]">
              ₹
              {youAreOwed.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[var(--summary-stat-bg)] border border-[var(--summary-border)] rounded-xl py-3 px-1 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Groups
            </span>
            <span className="text-sm font-extrabold">{groupsCount}</span>
          </div>
          <div className="bg-[var(--summary-stat-bg)] border border-[var(--summary-border)] rounded-xl py-3 px-1 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              People
            </span>
            <span className="text-sm font-extrabold">{peopleCount}</span>
          </div>
          <div className="bg-[var(--summary-stat-bg)] border border-[var(--summary-border)] rounded-xl py-3 px-1 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Settled
            </span>
            <span className="text-sm font-extrabold text-emerald-400">
              {settledPercentage}%
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={onAddExpense}
        className="w-full bg-[var(--summary-btn-bg)] hover:bg-[var(--summary-btn-hover-bg)] text-[var(--summary-btn-fg)] font-bold h-11 rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-md border-0"
      >
        <IconPlus size={15} /> Add expense
      </Button>
    </div>
  );
}

interface DashboardNavCardsProps {
  groupsCount: number;
  peopleCount: number;
}

export function DashboardNavCards({
  groupsCount,
  peopleCount,
}: DashboardNavCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-card border-border hover:border-primary/40 transition-colors shadow-sm rounded-2xl overflow-hidden cursor-pointer group">
        <CardContent className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <IconUsers
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-muted border border-border rounded-full">
              {groupsCount} groups
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-foreground">Groups</h4>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Manage trips, roommates, and shared bills.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border hover:border-primary/40 transition-colors shadow-sm rounded-2xl overflow-hidden cursor-pointer group">
        <CardContent className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
              <IconUserPlus
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-muted border border-border rounded-full">
              {peopleCount} people
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-foreground">People</h4>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Split with friends and settle up fast.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
