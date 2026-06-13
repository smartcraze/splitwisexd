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

function WaveDecoration({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 200 40"
      className="w-full h-10 mt-4"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,20 C30,35 60,5 90,20 C120,35 150,5 180,20 C195,27 200,25 200,25 L200,40 L0,40 Z"
        fill={color}
        opacity="0.25"
      />
      <path
        d="M0,28 C25,18 55,38 85,28 C115,18 145,38 175,28 C188,23 200,26 200,26 L200,40 L0,40 Z"
        fill={color}
        opacity="0.15"
      />
    </svg>
  );
}

export function SummaryCards({ summary }: SummaryProps) {
  const fmt = (amount: number) => {
    if (!Number.isFinite(amount)) return "₹0.00";
    return `₹${(Math.abs(amount) / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const cards = [
    {
      title: "Total Net Balance",
      value: summary.totalBalance,
      display: fmt(summary.totalBalance),
      sign: summary.totalBalance < 0 ? "-" : "",
      icon: Wallet,
      wave: summary.totalBalance >= 0 ? "#10B981" : "#EF4444",
      iconBg: summary.totalBalance >= 0
        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
        : "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
      valueColor: summary.totalBalance >= 0 ? "text-foreground" : "text-foreground",
      description: summary.totalBalance > 0
        ? "You are owed more than you owe"
        : summary.totalBalance < 0
          ? "You owe more than you are owed"
          : "All balanced",
    },
    {
      title: "You Are Owed",
      value: summary.youAreOwed,
      display: fmt(summary.youAreOwed),
      sign: "",
      icon: ArrowUpRight,
      wave: "#10B981",
      iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
      valueColor: "text-foreground",
      description: summary.youAreOwed > 0
        ? "Total money people owe you"
        : "No outstanding credits.",
    },
    {
      title: "You Owe",
      value: summary.youOwe,
      display: fmt(summary.youOwe),
      sign: "",
      icon: ArrowDownLeft,
      wave: "#F59E0B",
      iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
      valueColor: "text-foreground",
      description: summary.youOwe > 0
        ? "Total money you owe people"
        : "You don't owe anyone! 🎉",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="px-5 pt-5 pb-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {card.sign}{card.display}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 mb-1">
                {card.description}
              </p>
            </div>
            <WaveDecoration color={card.wave} />
          </motion.div>
        );
      })}
    </div>
  );
}
