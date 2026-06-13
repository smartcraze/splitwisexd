import { notFound, redirect } from "next/navigation";
import type React from "react";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/features/dashboard/dashboard-skeleton";
import { ExpensesView } from "@/components/features/expenses/expenses-view";
import { FriendsView } from "@/components/features/friends/friends-view";
import { GroupsView } from "@/components/features/groups/groups-view";
import { AppLayout } from "@/components/features/layout/app-layout";
import { NotificationsView } from "@/components/features/notifications/notifications-view";
import { SettlementsView } from "@/components/features/settlements/settlements-view";
import {
  getCachedExpenses,
  getCachedGroups,
  getCachedSettlements,
  getGroupBalances,
} from "@/lib/queries";
import { getSessionUser } from "@/lib/session";

type Props = { params: Promise<{ tab: string }> };

export default function DashboardTabDispatcher({ params }: Props) {
  return (
    <AppLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardTabDispatcherDynamic params={params} />
      </Suspense>
    </AppLayout>
  );
}

async function DashboardTabDispatcherDynamic({ params }: Props) {
  const { tab } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  let content: React.ReactNode = null;

  switch (tab) {
    case "groups": {
      const groups = await getCachedGroups(user.id);
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
      content = <GroupsView initialGroups={serializedGroups} />;
      break;
    }
    case "expenses": {
      const groups = await getCachedGroups(user.id);
      const all: any[] = [];
      await Promise.all(
        groups.map(async (g) => {
          const exps = await getCachedExpenses(g.id);
          exps.forEach((e) => all.push({ ...e, groupName: g.name }));
        }),
      );
      all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const serializedExpenses = all.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }));
      content = <ExpensesView initialExpenses={serializedExpenses} />;
      break;
    }
    case "settlements": {
      const groups = await getCachedGroups(user.id);
      const all: any[] = [];
      await Promise.all(
        groups.map(async (g) => {
          const s = await getCachedSettlements(g.id);
          s.forEach((item) => all.push({ ...item, groupName: g.name }));
        }),
      );
      all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const serializedSettlements = all.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      }));
      content = <SettlementsView initialSettlements={serializedSettlements} />;
      break;
    }
    case "friends": {
      const groups = await getCachedGroups(user.id);
      const friendMap = new Map<string, any>();

      await Promise.all(
        groups.map(async (g) => {
          const { debts } = await getGroupBalances(g.id);
          for (const debt of debts ?? []) {
            const isOwer = debt.fromUser.id === user.id;
            const isPayer = debt.toUser.id === user.id;
            if (!isOwer && !isPayer) continue;

            const other = isOwer ? debt.toUser : debt.fromUser;
            if (!friendMap.has(other.id)) {
              friendMap.set(other.id, {
                userId: other.id,
                name: other.name,
                email: other.email,
                youOwe: 0,
                owesYou: 0,
                groupIds: [],
              });
            }
            const f = friendMap.get(other.id)!;
            if (!f.groupIds.includes(g.id)) f.groupIds.push(g.id);
            if (isOwer) f.youOwe += debt.amount;
            else f.owesYou += debt.amount;
          }
        }),
      );

      const friends = Array.from(friendMap.values()).sort(
        (a, b) => b.owesYou + b.youOwe - (a.owesYou + a.youOwe),
      );
      content = <FriendsView initialFriends={friends} />;
      break;
    }
    case "notifications":
      content = <NotificationsView />;
      break;
    default:
      notFound();
  }

  return content;
}
