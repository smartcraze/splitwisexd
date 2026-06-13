"use client";

import React, { use } from "react";
import { notFound } from "next/navigation";
import { AppLayout } from "@/components/features/layout/app-layout";
import { GroupsView } from "@/components/features/groups/groups-view";
import { ExpensesView } from "@/components/features/expenses/expenses-view";
import { SettlementsView } from "@/components/features/settlements/settlements-view";
import { FriendsView } from "@/components/features/friends/friends-view";
import { NotificationsView } from "@/components/features/notifications/notifications-view";

type Props = { params: Promise<{ tab: string }> };

export default function DashboardTabDispatcher(props: Props) {
  const { tab } = use(props.params);

  let content: React.ReactNode = null;

  switch (tab) {
    case "groups":
      content = <GroupsView />;
      break;
    case "expenses":
      content = <ExpensesView />;
      break;
    case "settlements":
      content = <SettlementsView />;
      break;
    case "friends":
      content = <FriendsView />;
      break;
    case "notifications":
      content = <NotificationsView />;
      break;
    default:
      notFound();
  }

  return <AppLayout>{content}</AppLayout>;
}
