"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

interface GroupPageContentProps {
  groupId: string;
  group: any;
  expenses: any[];
  settlements: any[];
  balances: any[];
  debts: any[];
  currentUser: { id: string; name: string };
}

export function GroupPageContent({
  groupId,
  group,
  expenses,
  settlements,
  balances,
  debts,
  currentUser,
}: GroupPageContentProps) {
  const router = useRouter();
  const { socket } = useSocket();

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<any>(null);
  const [settleOpen, setSettleOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [prefillSettle, setPrefillSettle] = useState<any>(null);

  useEffect(() => {
    if (!socket || !groupId) return;
    socket.emit("join_group", groupId);
    socket.on("balance_update", () => {
      router.refresh();
    });
    return () => {
      socket.emit("leave_group", groupId);
      socket.off("balance_update");
    };
  }, [socket, groupId, router]);

  const handleSettleQuick = (fromId: string, toId: string, amount: number) => {
    setPrefillSettle(
      fromId === currentUser.id
        ? { paidToUserId: toId, amount }
        : { paidToUserId: fromId, amount },
    );
    setSettleOpen(true);
  };

  const handleDeleteExpense = async (expId: string) => {
    if (confirm("Are you sure?")) {
      await api.deleteExpense(expId);
      router.refresh();
    }
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <GroupHeader
        name={group.name}
        description={group.description}
        onAddExpense={() => {
          setEditExpense(null);
          setExpenseOpen(true);
        }}
        onSettleUp={() => {
          setPrefillSettle(null);
          setSettleOpen(true);
        }}
        onAddMember={() => setMemberOpen(true)}
      />

      <div className="grid gap-6 md:grid-cols-3 items-start">
        <div className="md:col-span-2 space-y-6 bg-card border border-border p-6 rounded-xl shadow-sm">
          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="bg-muted border border-border grid grid-cols-2 mb-4">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="settlements">Settlements</TabsTrigger>
            </TabsList>
            <TabsContent value="expenses">
              <ExpenseList
                groupId={groupId}
                expenses={expenses}
                currentUserId={currentUser.id}
                groupCreatorId={group.createdById}
                onEdit={(e) => {
                  setEditExpense(e);
                  setExpenseOpen(true);
                }}
                onDelete={handleDeleteExpense}
              />
            </TabsContent>
            <TabsContent value="settlements">
              <SettlementsList settlements={settlements} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <DebtVisualizer
            members={group.members}
            balances={balances}
            debts={debts}
            onSettleDebt={handleSettleQuick}
          />
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <GroupMembers
              groupId={groupId}
              members={group.members}
              currentUserId={currentUser.id}
              creatorId={group.createdById}
              onMemberRemoved={handleRefresh}
            />
          </div>
        </div>
      </div>

      <ExpenseFormDialog
        groupId={groupId}
        members={group.members}
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        onExpenseSaved={handleRefresh}
        editExpense={editExpense}
      />
      <SettleUpDialog
        groupId={groupId}
        members={group.members}
        currentUserId={currentUser.id}
        open={settleOpen}
        onOpenChange={setSettleOpen}
        onSettlementSaved={handleRefresh}
        prefill={prefillSettle}
      />
      <AddMemberDialog
        groupId={groupId}
        open={memberOpen}
        onOpenChange={setMemberOpen}
        onMemberAdded={handleRefresh}
      />
    </div>
  );
}
