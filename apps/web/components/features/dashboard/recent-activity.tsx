"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  CreditCard,
  Receipt,
  Users,
} from "lucide-react";
import React from "react";

interface ActivityItem {
  id: string;
  type: "expense" | "settlement" | "group";
  title: string;
  subtitle: string;
  amount?: number;
  groupName?: string;
  createdAt: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const ACTIVITY_ICONS = {
  expense: {
    icon: Receipt,
    bg: "bg-rose-100 dark:bg-rose-900/30",
    color: "text-rose-600",
  },
  settlement: {
    icon: CreditCard,
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    color: "text-emerald-600",
  },
  group: {
    icon: Users,
    bg: "bg-violet-100 dark:bg-violet-900/30",
    color: "text-violet-600",
  },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const fmt = (amount: number) =>
    `₹${(amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  if (activities.length === 0) return null;

  return (
    <div className="space-y-3">
      {activities.map((item, idx) => {
        const cfg = ACTIVITY_ICONS[item.type];
        const Icon = cfg.icon;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer"
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${cfg.bg}`}>
              <Icon className={`h-4 w-4 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {item.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                {item.amount !== undefined && (
                  <p className="text-sm font-bold text-rose-600">
                    {fmt(item.amount)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {timeAgo(item.createdAt)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </motion.div>
        );
      })}

      <button
        type="button"
        className="w-full flex items-center justify-center gap-1 py-3 text-sm font-semibold text-primary hover:underline"
      >
        View All Activity <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
