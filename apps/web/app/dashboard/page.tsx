import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getCachedGroups, getCachedUserSummary, getGroupBalances } from "@/lib/queries";
import { AppLayout } from "@/components/features/layout/app-layout";
import { DashboardContent } from "@/components/features/dashboard/dashboard-content";
import { DashboardSkeleton } from "@/components/features/dashboard/dashboard-skeleton";
import { prisma } from "@repo/db";

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

  // 2. Build recent activities from database directly
  const activities: any[] = [];
  for (const g of groups.slice(0, 3)) {
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

      for (const e of expenses) {
        activities.push({
          id: e.id,
          type: "expense",
          title: `You added an expense in ${g.name}`,
          subtitle: `${e.title} • ₹${(e.totalAmount / 100).toFixed(2)}`,
          amount: e.totalAmount,
          groupName: g.name,
          createdAt: e.createdAt.toISOString(),
        });
      }

      for (const s of settlements) {
        activities.push({
          id: s.id,
          type: "settlement",
          title: `${s.paidBy.name} paid ${s.paidTo.name} in ${g.name}`,
          subtitle: `₹${(s.amount / 100).toFixed(2)}`,
          groupName: g.name,
          createdAt: s.createdAt.toISOString(),
        });
      }
    } catch (_) {}
  }

  // Sort activities by date
  activities.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const recentActivities = activities.slice(0, 5);

  // 3. Collect debts from all groups for Settle Up panel
  const debtsList: any[] = [];
  for (const g of groups.slice(0, 5)) {
    try {
      const bal = await getGroupBalances(g.id);
      debtsList.push(...(bal.debts ?? []));
    } catch (_) {}
  }

  // Serialize models for safety (convert dates to ISO strings)
  const serializedGroups = groups.map((g) => ({
    ...g,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
    members: g.members.map((m) => ({
      ...m,
      joinedAt: m.joinedAt.toISOString(),
      user: {
        ...m.user,
      },
    })),
  }));

  const serializedSummary = {
    ...summary,
    groups: summary.groups.map((sg: any) => ({
      ...sg,
    })),
  };

  const serializedDebts = debtsList.map((d) => ({
    ...d,
    amount: d.amount,
    fromUser: { ...d.fromUser },
    toUser: { ...d.toUser },
  }));

  return (
    <DashboardContent
      groups={serializedGroups}
      summary={serializedSummary}
      allDebts={serializedDebts}
      recentActivities={recentActivities}
      user={user}
    />
  );
}
