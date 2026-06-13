"use client";

import { Loader2 } from "lucide-react";
import React, { use, useEffect, useState } from "react";
import { useAuth } from "@/components/features/auth/auth-context";
import { ExpenseFormDialog } from "@/components/features/expenses/expense-form-dialog";
import { ExpenseList } from "@/components/features/expenses/expense-list";
import { AddMemberDialog } from "@/components/features/groups/add-member-dialog";
import { DebtVisualizer } from "@/components/features/groups/debt-visualizer";
import { GroupHeader } from "@/components/features/groups/group-header";
import { GroupMembers } from "@/components/features/groups/group-members";
import { SettleUpDialog } from "@/components/features/settlements/settle-up-dialog";
import { SettlementsList } from "@/components/features/settlements/settlements-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useSocket } from "@/lib/socket";

type Props = { params: Promise<{ id: string }> };

export default function GroupPage(props: Props) {
  const { id: groupId } = use(props.params);
  const { user } = useAuth();
  const { socket } = useSocket();
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog open states
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<any>(null);
  const [settleOpen, setSettleOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [prefillSettle, setPrefillSettle] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [details, expList, setlList, balData] = await Promise.all([
        api.getGroupById(groupId),
        api.getExpenses(groupId),
        api.getSettlements(groupId),
        api.getBalances(groupId),
      ]);
      setGroup(details);
      setExpenses(expList);
      setSettlements(setlList);
      setBalances(balData.balances);
      setDebts(balData.debts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchData();
    // biome-ignore lint/correctness/useExhaustiveDependencies: run only on mount/groupId change
  }, [groupId]);

  useEffect(() => {
    if (!socket || !groupId) return;
    socket.emit("join_group", groupId);
    socket.on("balance_update", fetchData);
    return () => {
      socket.emit("leave_group", groupId);
      socket.off("balance_update", fetchData);
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: socket registers listener once
  }, [socket, groupId]);

  const handleSettleQuick = (fromId: string, toId: string, amount: number) => {
    setPrefillSettle(fromId === user?.id ? { paidToUserId: toId, amount } : { paidToUserId: fromId, amount });
    setSettleOpen(true);
  };

  const handleDeleteExpense = async (expId: string) => {
    if (confirm("Are you sure?")) {
      await api.deleteExpense(expId);
      fetchData();
    }
  };

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-muted/10 p-6 space-y-6 max-w-5xl mx-auto flex flex-col">
      <GroupHeader name={group.name} description={group.description} onAddExpense={() => { setEditExpense(null); setExpenseOpen(true); }} onSettleUp={() => { setPrefillSettle(null); setSettleOpen(true); }} onAddMember={() => setMemberOpen(true)} />
      <div className="grid gap-6 md:grid-cols-3 items-start">
        <div className="md:col-span-2 space-y-6 bg-card border border-border p-6 rounded-xl shadow-sm">
          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="bg-muted border border-border grid grid-cols-2 mb-4">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="settlements">Settlements</TabsTrigger>
            </TabsList>
            <TabsContent value="expenses"><ExpenseList groupId={groupId} expenses={expenses} currentUserId={user.id} groupCreatorId={group.createdById} onEdit={(e) => { setEditExpense(e); setExpenseOpen(true); }} onDelete={handleDeleteExpense} /></TabsContent>
            <TabsContent value="settlements"><SettlementsList settlements={settlements} /></TabsContent>
          </Tabs>
        </div>
        <div className="space-y-6">
          <DebtVisualizer members={group.members} balances={balances} debts={debts} onSettleDebt={handleSettleQuick} />
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm"><GroupMembers groupId={groupId} members={group.members} currentUserId={user.id} creatorId={group.createdById} onMemberRemoved={fetchData} /></div>
        </div>
      </div>
      <ExpenseFormDialog groupId={groupId} members={group.members} open={expenseOpen} onOpenChange={setExpenseOpen} onExpenseSaved={fetchData} editExpense={editExpense} />
      <SettleUpDialog groupId={groupId} members={group.members} currentUserId={user.id} open={settleOpen} onOpenChange={setSettleOpen} onSettlementSaved={fetchData} prefill={prefillSettle} />
      <AddMemberDialog groupId={groupId} open={memberOpen} onOpenChange={setMemberOpen} onMemberAdded={fetchData} />
    </div>
  );
}

