"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/features/auth/auth-context";
import { AppLayout } from "@/components/features/layout/app-layout";
import { GroupsList } from "@/components/features/dashboard/groups-list";
import { RecentActivity } from "@/components/features/dashboard/recent-activity";
import { SettleUpPanel } from "@/components/features/dashboard/settle-up-panel";
import { SpendingChart } from "@/components/features/dashboard/spending-chart";
import { SummaryCards } from "@/components/features/dashboard/summary-cards";
import { DashboardSkeleton } from "@/components/features/dashboard/dashboard-skeleton";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    youAreOwed: 0,
    youOwe: 0,
  });
  const [allDebts, setAllDebts] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [groupsData, summaryData] = await Promise.all([
        api.getGroups(),
        api.getUserSummary(),
      ]);
      setGroups(groupsData);
      setSummary(summaryData);

      // Build recent activities from expenses & settlements across groups
      const activities: any[] = [];
      for (const g of groupsData.slice(0, 3)) {
        try {
          const [expenses, settlements] = await Promise.all([
            api.getExpenses(g.id),
            api.getSettlements(g.id),
          ]);
          for (const e of expenses.slice(0, 2)) {
            activities.push({
              id: e.id,
              type: "expense",
              title: `You added an expense in ${g.name}`,
              subtitle: `${e.title} • ₹${(e.totalAmount / 100).toFixed(2)}`,
              amount: e.totalAmount,
              groupName: g.name,
              createdAt: e.createdAt,
            });
          }
          for (const s of settlements.slice(0, 1)) {
            activities.push({
              id: s.id,
              type: "settlement",
              title: `${s.paidBy.name} paid ${s.paidTo.name} in ${g.name}`,
              subtitle: `₹${(s.amount / 100).toFixed(2)}`,
              groupName: g.name,
              createdAt: s.createdAt,
            });
          }
        } catch (_) {}
      }

      // Sort by date
      activities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setRecentActivities(activities.slice(0, 5));

      // Collect debts from all groups for Settle Up panel
      const debtsList: any[] = [];
      for (const g of groupsData.slice(0, 5)) {
        try {
          const bal = await api.getBalances(g.id);
          debtsList.push(...(bal.debts ?? []));
        } catch (_) {}
      }
      setAllDebts(debtsList);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
    // biome-ignore lint/correctness/useExhaustiveDependencies: run only when user changes
  }, [user]);

  if (authLoading || (user && loading)) {
    return (
      <AppLayout>
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  if (!user) return null;

  const totalSpend = summary.youOwe + summary.youAreOwed;

  return (
    <AppLayout onGroupCreated={fetchData}>
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
                <h2 className="text-xl font-bold tracking-tight">
                  Your Groups
                </h2>
              </div>
              <GroupsList groups={groups} onGroupCreated={fetchData} />
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
              <SettleUpPanel debts={allDebts} currentUserId={user.id} />
            )}
            <SpendingChart totalAmount={totalSpend} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
