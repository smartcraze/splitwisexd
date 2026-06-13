"use client";

import { IconBell, IconReload } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateGroupDialog } from "@/components/features/dashboard/create-group-dialog";
import { DashboardChart } from "@/components/features/dashboard/dashboard-chart";
import {
  DashboardNavCards,
  DashboardSummary,
} from "@/components/features/dashboard/dashboard-summary";
import { GroupList } from "@/components/features/dashboard/group-list";
import { RecentActivity } from "@/components/features/dashboard/recent-activity";
import { ExpenseDialog } from "@/components/features/expenses/expense-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
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
  const { user } = useAuth();
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [groupDetails, setGroupDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog controls
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectGroupOpen, setSelectGroupOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const loadDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const summaryData = await fetchApi<UserSummary>("/groups/summary");
      setSummary(summaryData);

      // Fetch details, expenses, and settlements for all groups in parallel
      const groupPromises = summaryData.groups.map((g) =>
        fetchApi(`/groups/${g.groupId}`).catch(() => null),
      );
      const expensePromises = summaryData.groups.map((g) =>
        fetchApi<any[]>(`/expenses?groupId=${g.groupId}`).catch(() => []),
      );
      const settlementPromises = summaryData.groups.map((g) =>
        fetchApi<any[]>(`/settlements?groupId=${g.groupId}`).catch(() => []),
      );

      const [gDetails, eResults, sResults] = await Promise.all([
        Promise.all(groupPromises),
        Promise.all(expensePromises),
        Promise.all(settlementPromises),
      ]);

      setGroupDetails(gDetails.filter(Boolean));
      setExpenses(eResults.flat());
      setSettlements(sResults.flat());
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute stats dynamically
  const getDynamicStats = () => {
    if (!summary || groupDetails.length === 0)
      return { peopleCount: 0, settledPercentage: 100 };

    // Unique people count excluding current user
    const memberIds = new Set<string>();
    for (const g of groupDetails) {
      for (const m of g.members) {
        if (m.userId !== user?.id) memberIds.add(m.userId);
      }
    }

    // Settled groups ratio
    const settledGroups = summary.groups.filter(
      (g) => g.netBalance === 0,
    ).length;
    const settledPercentage =
      summary.groups.length > 0
        ? Math.round((settledGroups / summary.groups.length) * 100)
        : 100;

    return { peopleCount: memberIds.size, settledPercentage };
  };

  // Compile recent activity activities (up to 3 items)
  const getRecentActivities = (): any[] => {
    const list: any[] = [];

    // Map expenses
    for (const exp of expenses) {
      const userPart = exp.participants.find((p: any) => p.userId === user?.id);
      const isPayer = exp.paidByUserId === user?.id;
      if (!isPayer && !userPart) continue;

      const owed = userPart ? userPart.owedAmount : 0;
      const paid = isPayer ? exp.totalAmount : 0;
      const net = paid - owed;

      list.push({
        id: `exp-${exp.id}`,
        type: "expense",
        title: exp.title,
        amount: net,
        isCredit: net >= 0,
        meta:
          exp.participants.length > 1
            ? `Shared with ${exp.participants.length} people`
            : "Shared bill",
        createdAt: exp.createdAt,
      });
    }

    // Map settlements
    for (const s of settlements) {
      const isSender = s.paidByUserId === user?.id;
      const isReceiver = s.paidToUserId === user?.id;
      if (!isSender && !isReceiver) continue;

      list.push({
        id: `settle-${s.id}`,
        type: "settlement",
        title: isSender
          ? `Payment to ${s.paidTo.name}`
          : `Payment from ${s.paidBy.name}`,
        amount: s.amount,
        isCredit: isReceiver,
        meta: s.note || "Settlement",
        createdAt: s.createdAt,
      });
    }

    return list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  };

  const handleAddExpenseClick = () => {
    if (!summary || summary.groups.length === 0) {
      toast.error("Please create a group first");
      setCreateDialogOpen(true);
      return;
    }
    if (summary.groups.length === 1) {
      setSelectedGroupId(summary.groups[0]!.groupId);
      setExpenseOpen(true);
    } else {
      setSelectGroupOpen(true);
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground font-medium">
          Synchronizing Ledger...
        </p>
      </div>
    );
  }

  const { peopleCount, settledPercentage } = getDynamicStats();
  const recentActivities = getRecentActivities();
  const greeting = (() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  })();

  const selectedGroup = groupDetails.find((g) => g.id === selectedGroupId);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Mockup Header Style */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground tracking-wide block">
            {greeting}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Splitwise
          </h1>
          <p className="text-xs text-muted-foreground">
            Track shared expenses across groups and people.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadDashboardData(true)}
            className="rounded-xl border-border bg-card cursor-pointer"
            title="Refresh"
          >
            <IconReload size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl border-border bg-card relative cursor-pointer"
            title="Notifications"
          >
            <IconBell size={16} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </Button>
        </div>
      </div>

      {/* Main Grid: Left side black ledger + graph | Right side stats + recent activity + cover group */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <DashboardSummary
            totalBalance={summary.totalBalance}
            youOwe={summary.youOwe}
            youAreOwed={summary.youAreOwed}
            groupsCount={summary.groups.length}
            peopleCount={peopleCount}
            settledPercentage={settledPercentage}
            onAddExpense={handleAddExpenseClick}
          />
          <DashboardChart expenses={expenses} currentUserId={user!.id} />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <DashboardNavCards
            groupsCount={summary.groups.length}
            peopleCount={peopleCount}
          />
          <RecentActivity activities={recentActivities} />
          <GroupList
            groups={summary.groups}
            onCreateOpen={() => setCreateDialogOpen(true)}
          />
        </div>
      </div>

      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => loadDashboardData(true)}
      />

      {/* Select Group Dialog */}
      <Dialog open={selectGroupOpen} onOpenChange={setSelectGroupOpen}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Select Group</DialogTitle>
            <DialogDescription>
              Which group is this expense for?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-48 overflow-y-auto pr-1">
            {summary.groups.map((g) => (
              <Button
                key={g.groupId}
                onClick={() => {
                  setSelectedGroupId(g.groupId);
                  setSelectGroupOpen(false);
                  setExpenseOpen(true);
                }}
                className="w-full justify-start text-xs border border-border bg-card text-foreground hover:bg-muted font-bold h-10 cursor-pointer"
              >
                {g.groupName}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {selectedGroup && (
        <ExpenseDialog
          open={expenseOpen}
          onOpenChange={setExpenseOpen}
          groupId={selectedGroupId}
          members={selectedGroup.members}
          onSuccess={() => loadDashboardData(true)}
        />
      )}
    </div>
  );
}
