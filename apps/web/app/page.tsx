"use client";

import { Landmark, Loader2, LogOut } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/features/auth/auth-context";
import { CreateGroupModal } from "@/components/features/dashboard/create-group-modal";
import { GroupsList } from "@/components/features/dashboard/groups-list";
import { SummaryCards } from "@/components/features/dashboard/summary-cards";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalBalance: 0, youAreOwed: 0, youOwe: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [groupsData, summaryData] = await Promise.all([
        api.getGroups(),
        api.getUserSummary(),
      ]);
      setGroups(groupsData);
      setSummary(summaryData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: run only when user changes
  }, [user]);


  if (authLoading || (user && loading)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="border-b border-border bg-card py-4 px-6 shrink-0 flex items-center justify-between shadow-sm">
        <LinkHome />
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold hidden sm:block">
            Hello, {user.name}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-9 w-9 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4.5 w-4.5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your shared expenses and groups
            </p>
          </div>
          <CreateGroupModal onGroupCreated={fetchData} />
        </div>

        <SummaryCards summary={summary} />

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Your Groups</h2>
          <GroupsList groups={groups} />
        </div>
      </main>
    </div>
  );
}

function LinkHome() {
  return (
    <div className="flex items-center gap-2 cursor-pointer font-extrabold text-lg tracking-tight hover:opacity-95">
      <div className="p-1.5 bg-primary text-primary-foreground rounded-lg">
        <Landmark className="h-5 w-5" />
      </div>
      <span>
        Splitwise<span className="text-primary">XD</span>
      </span>
    </div>
  );
}
