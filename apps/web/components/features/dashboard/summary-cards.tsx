"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import React from "react";

interface SummaryProps {
  summary: {
    totalBalance: number;
    youAreOwed: number;
    youOwe: number;
  };
}

export function SummaryCards({ summary }: SummaryProps) {
  const formatCurrency = (amount: number) => {
    return `₹${(Math.abs(amount) / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const cards = [
    {
      title: "Total Net Balance",
      value: summary.totalBalance,
      formatted: formatCurrency(summary.totalBalance),
      icon: Wallet,
      colorClass:
        summary.totalBalance > 0
          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
          : summary.totalBalance < 0
            ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20"
            : "text-muted-foreground bg-muted",
      description:
        summary.totalBalance > 0
          ? "You are net positive"
          : summary.totalBalance < 0
            ? "You owe more than you are owed"
            : "All settled up! No active debts.",
    },
    {
      title: "You Are Owed",
      value: summary.youAreOwed,
      formatted: formatCurrency(summary.youAreOwed),
      icon: ArrowUpRight,
      colorClass:
        "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20",
      description:
        summary.youAreOwed > 0
          ? "Total money people owe you"
          : "No outstanding credits.",
    },
    {
      title: "You Owe",
      value: summary.youOwe,
      formatted: formatCurrency(summary.youOwe),
      icon: ArrowDownLeft,
      colorClass:
        "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20",
      description:
        summary.youOwe > 0
          ? "Total money you owe people"
          : "You don't owe anyone anything! 🎉",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="rounded-xl bg-card p-6 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {card.title}
              </span>
              <div className={`p-2 rounded-full ${card.colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold tracking-tight">
                {card.value < 0 && "-"}
                {card.formatted}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
