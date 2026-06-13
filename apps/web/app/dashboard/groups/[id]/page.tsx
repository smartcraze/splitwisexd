"use client";

import {
  IconChevronLeft,
  IconHistory,
  IconPlus,
  IconUpload,
  IconWallet,
} from "@tabler/icons-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { ExpenseDetailsDialog } from "@/components/features/expenses/expense-details-dialog";
import { ExpenseDialog } from "@/components/features/expenses/expense-dialog";
import { ExpenseList } from "@/components/features/groups/expense-list";
import { MemberList } from "@/components/features/groups/member-list";
import { SettleDialog } from "@/components/features/groups/settle-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { fetchApi } from "@/lib/api";

export default function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = use(params);
  const { user } = useAuth();
  const [group, setGroup] = useState<any>(null);
  const [balancesData, setBalancesData] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<any>(null);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const loadAllData = async () => {
    try {
      const [g, b, e, s] = await Promise.all([
        fetchApi(`/groups/${groupId}`),
        fetchApi(`/groups/${groupId}/balances`),
        fetchApi(`/expenses?groupId=${groupId}`),
        fetchApi(`/settlements?groupId=${groupId}`),
      ]);
      setGroup(g);
      setBalancesData(b);
      setExpenses(e);
      setSettlements(s);
    } catch (err: any) {
      toast.error(err.message || "Failed to load group details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [groupId]);

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await fetchApi(`/expenses/${id}`, { method: "DELETE" });
      toast.success("Expense deleted");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete expense");
    }
  };

  if (loading || !group) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            <IconChevronLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {group.name}
          </h1>
          <p className="text-sm text-muted-foreground">{group.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/groups/${groupId}/import`}>
            <Button
              variant="outline"
              className="cursor-pointer border-border font-bold text-xs"
            >
              <IconUpload size={16} className="mr-1" /> Import CSV
            </Button>
          </Link>
          <Button
            onClick={() => setSettleOpen(true)}
            variant="outline"
            className="cursor-pointer border-border font-bold text-xs"
          >
            <IconWallet size={16} className="mr-1" /> Settle Up
          </Button>
          <Button
            onClick={() => {
              setEditExpense(null);
              setExpenseOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs cursor-pointer"
          >
            <IconPlus size={16} className="mr-1" /> Add Expense
          </Button>
        </div>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 border border-border p-1 rounded-xl">
          <TabsTrigger
            value="expenses"
            className="rounded-lg text-xs font-bold cursor-pointer"
          >
            Expenses
          </TabsTrigger>
          <TabsTrigger
            value="balances"
            className="rounded-lg text-xs font-bold cursor-pointer"
          >
            Balances & Debts
          </TabsTrigger>
          <TabsTrigger
            value="settlements"
            className="rounded-lg text-xs font-bold cursor-pointer"
          >
            Payment Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-4">
          <ExpenseList
            expenses={expenses}
            members={group.members}
            currentUserId={user!.id}
            onSelectExpense={setSelectedExpense}
            onEditExpense={(exp) => {
              setEditExpense(exp);
              setExpenseOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
          />
        </TabsContent>

        <TabsContent
          value="balances"
          className="mt-4 grid md:grid-cols-2 gap-6"
        >
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Outstanding Debts
            </h3>
            {balancesData?.debts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Everyone is fully settled up in this group!
              </p>
            ) : (
              <div className="border border-border rounded-xl bg-card divide-y divide-border overflow-hidden">
                {balancesData?.debts.map((d: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3.5 text-xs"
                  >
                    <div>
                      <span className="font-bold">{d.fromUser.name}</span> owes{" "}
                      <span className="font-bold">{d.toUser.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-500">
                        ₹{d.amount.toLocaleString()}
                      </span>
                      {d.fromUser.id === user!.id && (
                        <Button
                          size="sm"
                          onClick={() => setSettleOpen(true)}
                          className="h-7 px-2.5 bg-primary hover:bg-primary/90 text-[10px] font-bold cursor-pointer"
                        >
                          Pay
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <MemberList
            groupId={groupId}
            members={group.members}
            onRefresh={loadAllData}
            currentUserId={user!.id}
          />
        </TabsContent>

        <TabsContent value="settlements" className="mt-4 space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <IconHistory size={16} /> Settlement Activity
          </h3>
          {settlements.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No settlements recorded yet.
            </p>
          ) : (
            <div className="border border-border rounded-xl bg-card divide-y divide-border overflow-hidden">
              {settlements.map((s: any) => (
                <div
                  key={s.id}
                  className="p-3.5 hover:bg-muted/10 transition-colors text-xs flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold">{s.paidBy.name}</span> sent{" "}
                    <span className="font-bold text-emerald-500">
                      ₹{s.amount.toLocaleString()}
                    </span>{" "}
                    to <span className="font-bold">{s.paidTo.name}</span>
                    {s.note && (
                      <span className="text-muted-foreground ml-1">
                        ({s.note})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ExpenseDialog
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        groupId={groupId}
        members={group.members}
        expenseToEdit={editExpense}
        onSuccess={loadAllData}
      />
      <ExpenseDetailsDialog
        open={!!selectedExpense}
        onOpenChange={(open) => {
          if (!open) setSelectedExpense(null);
        }}
        expense={selectedExpense}
        currentUserId={user!.id}
      />
      <SettleDialog
        open={settleOpen}
        onOpenChange={setSettleOpen}
        groupId={groupId}
        members={group.members}
        currentUserId={user!.id}
        onSuccess={loadAllData}
      />
    </div>
  );
}
