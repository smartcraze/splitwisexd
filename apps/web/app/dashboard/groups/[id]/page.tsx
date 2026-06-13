import { prisma } from "@repo/db";
import { notFound, redirect } from "next/navigation";
import React, { Suspense } from "react";
import { GroupDetailSkeleton } from "@/components/features/groups/group-detail-skeleton";
import { GroupPageContent } from "@/components/features/groups/group-page-content";
import { AppLayout } from "@/components/features/layout/app-layout";
import {
  getCachedExpenses,
  getCachedSettlements,
  getGroupBalances,
} from "@/lib/queries";
import { getSessionUser } from "@/lib/session";

type Props = { params: Promise<{ id: string }> };

export default function GroupPage({ params }: Props) {
  return (
    <AppLayout>
      <Suspense fallback={<GroupDetailSkeleton />}>
        <GroupPageDynamic params={params} />
      </Suspense>
    </AppLayout>
  );
}

async function GroupPageDynamic({ params }: Props) {
  const { id: groupId } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // Security: Check if user is a member of the group
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: user.id,
      },
    },
  });

  if (!membership) {
    redirect("/dashboard/groups");
  }

  // Fetch data concurrently on the server
  const [group, expenses, settlements, balancesData] = await Promise.all([
    prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    }),
    getCachedExpenses(groupId),
    getCachedSettlements(groupId),
    getGroupBalances(groupId),
  ]);

  if (!group) {
    notFound();
  }

  // Serialize objects for client hydration
  const serializedGroup = {
    ...group,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    members: group.members.map((m) => ({
      ...m,
      joinedAt: m.joinedAt.toISOString(),
      user: { ...m.user },
    })),
  };

  const serializedExpenses = expenses.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  const serializedSettlements = settlements.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  const serializedBalances = balancesData.balances.map((b) => ({
    ...b,
  }));

  const serializedDebts = balancesData.debts.map((d) => ({
    ...d,
    fromUser: { ...d.fromUser },
    toUser: { ...d.toUser },
  }));

  return (
    <GroupPageContent
      groupId={groupId}
      group={serializedGroup}
      expenses={serializedExpenses}
      settlements={serializedSettlements}
      balances={serializedBalances}
      debts={serializedDebts}
      currentUser={user}
    />
  );
}
