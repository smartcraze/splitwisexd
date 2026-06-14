"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { GroupsList } from "@/components/features/dashboard/groups-list";
import { RecentActivity } from "@/components/features/dashboard/recent-activity";
import { SettleUpPanel } from "@/components/features/dashboard/settle-up-panel";
import { SpendingChart } from "@/components/features/dashboard/spending-chart";
import { SummaryCards } from "@/components/features/dashboard/summary-cards";
import { SettleUpDialog } from "@/components/features/settlements/settle-up-dialog";

interface DashboardContentProps {
  groups: any[];
  summary: {
    totalBalance: number;
    youAreOwed: number;
    youOwe: number;
  };
  allDebts: any[];
  recentActivities: any[];
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function DashboardContent({
  groups,
  summary,
  allDebts,
  recentActivities,
  user,
}: DashboardContentProps) {
  const router = useRouter();
  const totalSpend = summary.youOwe + summary.youAreOwed;

  const [settleOpen, setSettleOpen] = useState(false);
  const [settlePrefill, setSettlePrefill] = useState<{
    paidToUserId: string;
    amount: number;
  } | null>(null);
  const [settleGroupId, setSettleGroupId] = useState<string>("");

  const handleGroupCreated = () => {
    router.refresh();
  };

  const handleSettleClick = (debt: any) => {
    setSettleGroupId(debt.groupId);
    setSettlePrefill({
      paidToUserId: debt.toUser.id,
      amount: debt.amount,
    });
    setSettleOpen(true);
  };

  const activeGroup = groups.find((g) => g.id === settleGroupId);
  const activeMembers = activeGroup ? activeGroup.members : [];

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex gap-6 items-start">
        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Overview
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Here's what's happening with your expenses
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground px-3 py-1.5 border border-border rounded-lg flex items-center gap-1.5">
                📅 This Month
              </span>
            </div>
          </div>

          <SummaryCards summary={summary} />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Your Groups</h2>
            </div>
            <GroupsList groups={groups} onGroupCreated={handleGroupCreated} />
          </div>

          {recentActivities.length > 0 && (
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-4">
                Recent Activity
              </h2>
              <div className="bg-card rounded-2xl border border-border shadow-sm">
                <RecentActivity activities={recentActivities} />
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="hidden xl:flex flex-col gap-5 w-[300px] shrink-0">
          {allDebts.length > 0 && (
            <SettleUpPanel
              debts={allDebts}
              currentUserId={user.id}
              onSettle={handleSettleClick}
              onRemind={(debt) =>
                alert(`Reminder sent to ${debt.fromUser.name}!`)
              }
            />
          )}
          <SpendingChart totalAmount={totalSpend} />
        </div>
      </div>

      <SettleUpDialog
        groupId={settleGroupId}
        members={activeMembers}
        currentUserId={user.id}
        open={settleOpen}
        onOpenChange={setSettleOpen}
        onSettlementSaved={() => router.refresh()}
        prefill={settlePrefill}
      />
    </div>
  );
}
