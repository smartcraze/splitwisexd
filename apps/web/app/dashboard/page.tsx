import { prisma } from "@repo/db";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import { DashboardContent } from "@/components/features/dashboard/dashboard-content";
import { DashboardSkeleton } from "@/components/features/dashboard/dashboard-skeleton";
import { AppLayout } from "@/components/features/layout/app-layout";
import {
  getCachedGroups,
  getCachedUserSummary,
  getGroupBalances,
} from "@/lib/queries";
import { getSessionUser } from "@/lib/session";

export default function DashboardPage() {
  return (
    <AppLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardPageContentDynamic />
      </Suspense>
    </AppLayout>
  );
}

async function DashboardPageContentDynamic() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Fetch cached groups & summary directly on the server
  const [groups, summary] = await Promise.all([
    getCachedGroups(user.id),
    getCachedUserSummary(user.id),
  ]);

  // 2. Build recent activities from database as a Promise
  const recentActivitiesPromise = (async () => {
    const activities: any[] = [];
    const promises = groups.slice(0, 3).map(async (g) => {
      try {
        const [expenses, settlements] = await Promise.all([
          prisma.expense.findMany({
            where: { groupId: g.id },
            include: { paidBy: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 2,
          }),
          prisma.settlement.findMany({
            where: { groupId: g.id, status: "COMPLETED" },
            include: {
              paidBy: { select: { name: true } },
              paidTo: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          }),
        ]);
        return { group: g, expenses, settlements };
      } catch (_) {
        return { group: g, expenses: [], settlements: [] };
      }
    });

    const results = await Promise.all(promises);
    for (const { group, expenses, settlements } of results) {
      for (const e of expenses) {
        activities.push({
          id: e.id,
          type: "expense",
          title: `You added an expense in ${group.name}`,
          subtitle: `${e.title} • ₹${(e.totalAmount / 100).toFixed(2)}`,
          amount: e.totalAmount,
          groupName: group.name,
          createdAt: e.createdAt.toISOString(),
        });
      }
      for (const s of settlements) {
        activities.push({
          id: s.id,
          type: "settlement",
          title: `${s.paidBy.name} paid ${s.paidTo.name} in ${group.name}`,
          subtitle: `₹${(s.amount / 100).toFixed(2)}`,
          groupName: group.name,
          createdAt: s.createdAt.toISOString(),
        });
      }
    }
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return activities.slice(0, 5);
  })();

  // 3. Collect debts from all groups for Settle Up panel as a Promise
  const allDebtsPromise = (async () => {
    const promises = groups.slice(0, 5).map(async (g) => {
      try {
        const bal = await getGroupBalances(g.id);
        if (bal.debts) {
          return bal.debts.map((d: any) => ({
            ...d,
            groupId: g.id,
            amount: d.amount,
            fromUser: { ...d.fromUser },
            toUser: { ...d.toUser },
          }));
        }
      } catch (_) {}
      return [];
    });
    const results = await Promise.all(promises);
    return results.flat();
  })();

  // Serialize models for safety (convert dates to ISO strings)
  const serializedGroups = groups.map((g) => ({
    ...g,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
    members: g.members.map((m) => ({
      ...m,
      joinedAt: m.joinedAt.toISOString(),
      user: { ...m.user },
    })),
  }));

  const serializedSummary = {
    ...summary,
    groups: summary.groups.map((sg: any) => ({ ...sg })),
  };

  return (
    <DashboardContent
      groups={serializedGroups}
      summary={serializedSummary}
      recentActivitiesPromise={recentActivitiesPromise}
      allDebtsPromise={allDebtsPromise}
      user={user}
    />
  );
}
