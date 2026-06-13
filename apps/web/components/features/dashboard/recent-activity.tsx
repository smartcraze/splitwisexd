"use client";

import {
  IconArrowDownRight,
  IconArrowUpLeft,
  IconCoin,
  IconReceipt,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";

interface Activity {
  id: string;
  type: "expense" | "settlement";
  title: string;
  amount: number;
  isCredit: boolean;
  meta: string;
  createdAt: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const formatTimeAgo = (dateStr: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(dateStr).getTime()) / 1000,
    );
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const displayActivities = activities.slice(0, 3);

  return (
    <Card className="bg-card border-border border-2 rounded-3xl overflow-hidden shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="font-extrabold text-foreground">
            Recent activity
          </span>
          <span className="text-[10px] font-bold text-muted-foreground hover:text-primary cursor-pointer">
            See all
          </span>
        </div>

        {displayActivities.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            No recent transactions.
          </p>
        ) : (
          <div className="space-y-3">
            {displayActivities.map((act) => (
              <div
                key={act.id}
                className="flex justify-between items-center gap-3 border border-border/50 rounded-2xl p-3 bg-muted/10 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center border ${act.type === "expense" ? "bg-primary/5 text-primary border-primary/10" : "bg-emerald-500/5 text-emerald-500 border-emerald-500/10"}`}
                  >
                    {act.type === "expense" ? (
                      <IconReceipt size={16} />
                    ) : (
                      <IconCoin size={16} />
                    )}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h5 className="text-xs font-bold text-foreground truncate leading-tight">
                      {act.title}
                    </h5>
                    <p className="text-[9px] text-muted-foreground truncate">
                      {act.meta} &bull; {formatTimeAgo(act.createdAt)}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-xs font-extrabold shrink-0 ${act.isCredit ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {act.isCredit ? "+" : "-"}₹
                  {Math.abs(act.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
