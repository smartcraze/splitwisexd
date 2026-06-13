"use client";

import { IconReload } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateGroupDialog } from "@/components/features/dashboard/create-group-dialog";
import { DashboardSummary } from "@/components/features/dashboard/dashboard-summary";
import { GroupList } from "@/components/features/dashboard/group-list";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";

interface UserSummary {
  totalBalance: number;
  youOwe: number;
  youAreOwed: number;
  groups: {
    groupId: string;
    groupName: string;
    netBalance: number;
    youOwe: number;
    youAreOwed: number;
  }[];
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchApi<UserSummary>("/groups/summary");
      setSummary(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground font-medium">
          Loading summary...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Keep track of your shared expenses and outstanding debts.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => loadDashboardData(true)}
          className="rounded-xl cursor-pointer"
          title="Refresh Dashboard"
        >
          <IconReload size={18} />
        </Button>
      </div>

      {summary && (
        <>
          <DashboardSummary
            totalBalance={summary.totalBalance}
            youOwe={summary.youOwe}
            youAreOwed={summary.youAreOwed}
          />
          <GroupList
            groups={summary.groups}
            onCreateOpen={() => setCreateDialogOpen(true)}
          />
        </>
      )}

      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => loadDashboardData(true)}
      />
    </div>
  );
}
