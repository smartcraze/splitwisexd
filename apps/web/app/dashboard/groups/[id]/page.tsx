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

const getGroupTheme = (name: string, desc = "") => {
  const text = `${name} ${desc}`.toLowerCase();
  if (/home|flat|electricity|rent|house|room|roommate|stay|apart/i.test(text)) {
    return {
      name: "Flat group",
      image:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80",
      kanji: "家",
    };
  }
  if (
    /dinner|food|restaurant|ramen|sushi|cafe|party|lunch|drink|pub|bar/i.test(
      text,
    )
  ) {
    return {
      name: "Food group",
      image:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&auto=format&fit=crop&q=80",
      kanji: "食",
    };
  }
  if (
    /trip|travel|vacation|dollar|USD|outing|gate|trek|flight|train|bus|car|mountain/i.test(
      text,
    )
  ) {
    return {
      name: "Travel group",
      image:
        "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&auto=format&fit=crop&q=80",
      kanji: "旅",
    };
  }
  return {
    name: "General group",
    image:
      "https://images.unsplash.com/photo-1512427691650-15fcce1dc7b1?w=1200&auto=format&fit=crop&q=80",
    kanji: "倶",
  };
};

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

  const theme = getGroupTheme(group.name, group.description || "");

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <IconChevronLeft size={14} /> Back to Dashboard
      </Link>

      {/* Immersive Theme Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 shadow-md">
        <div className="relative h-48 sm:h-56 w-full bg-muted overflow-hidden">
          <img
            src={theme.image}
            alt={group.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Hanko Stamp Signature overlay */}
          <div className="absolute top-4 right-4 rotate-[-8deg] select-none scale-110">
            <svg
              width="38"
              height="38"
              viewBox="0 0 34 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="17"
                cy="17"
                r="14"
                stroke="var(--crimson)"
                strokeWidth="1.8"
                strokeDasharray="30 1 12 0.5 20 1"
                className="opacity-95"
              />
              <circle
                cx="17"
                cy="17"
                r="11"
                stroke="var(--crimson)"
                strokeWidth="0.8"
                className="opacity-80"
              />
              <text
                x="17"
                y="21"
                fill="var(--crimson)"
                fontSize="9"
                fontWeight="950"
                textAnchor="middle"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {theme.kanji}
              </text>
            </svg>
          </div>

          {/* Group Details Text */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              {theme.name}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight truncate">
              {group.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl truncate">
              {group.description || "Shared expense group"} &bull;{" "}
              {group.members.length} members
            </p>
          </div>
        </div>
      </div>

      {/* Actions & Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/groups/${groupId}/import`}>
            <Button
              variant="outline"
              className="cursor-pointer border-border font-bold text-xs rounded-xl bg-card hover:bg-muted"
            >
              <IconUpload size={16} className="mr-1 text-primary" /> Import CSV
            </Button>
          </Link>
          <Button
            onClick={() => setSettleOpen(true)}
            variant="outline"
            className="cursor-pointer border-border font-bold text-xs rounded-xl bg-card hover:bg-muted"
          >
            <IconWallet size={16} className="mr-1 text-emerald-500" /> Settle Up
          </Button>
          <Button
            onClick={() => {
              setEditExpense(null);
              setExpenseOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs cursor-pointer rounded-xl"
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
