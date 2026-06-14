"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ExpenseFormDialog } from "@/components/features/expenses/expense-form-dialog";
import { ExpenseList } from "@/components/features/expenses/expense-list";
import { AddMemberDialog } from "@/components/features/groups/add-member-dialog";
import { CSVImportDialog } from "@/components/features/groups/csv-import-dialog";
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
  const [importOpen, setImportOpen] = useState(false);
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

  const handleExportCSV = () => {
    const headers = [
      "date",
      "description",
      "paid_by",
      "amount",
      "currency",
      "split_type",
      "split_with",
      "split_details",
      "notes",
    ];

    const escapeCSV = (str: string | null | undefined) => {
      if (!str) return "";
      const cleaned = str.replace(/\r?\n|\r/g, " ");
      if (cleaned.includes(",") || cleaned.includes('"')) {
        return `"${cleaned.replace(/"/g, '""')}"`;
      }
      return cleaned;
    };

    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
    };

    const rows: string[][] = [];

    // Format expenses
    for (const e of expenses) {
      const splitWithNames = e.participants
        .map(
          (p: any) =>
            p.user?.name ||
            group.members.find((m: any) => m.userId === p.userId)?.user?.name,
        )
        .filter(Boolean)
        .join(";");

      let splitDetails = "";
      if (e.splitMethod === "UNEQUAL") {
        splitDetails = e.participants
          .map((p: any) => {
            const name =
              p.user?.name ||
              group.members.find((m: any) => m.userId === p.userId)?.user
                ?.name ||
              "";
            return `${name} ${p.owedAmount / 100}`;
          })
          .filter(Boolean)
          .join("; ");
      } else if (e.splitMethod === "PERCENTAGE") {
        splitDetails = e.participants
          .map((p: any) => {
            const name =
              p.user?.name ||
              group.members.find((m: any) => m.userId === p.userId)?.user
                ?.name ||
              "";
            return `${name} ${p.percentage}%`;
          })
          .filter(Boolean)
          .join("; ");
      } else if (e.splitMethod === "SHARES") {
        splitDetails = e.participants
          .map((p: any) => {
            const name =
              p.user?.name ||
              group.members.find((m: any) => m.userId === p.userId)?.user
                ?.name ||
              "";
            return `${name} ${p.shares}`;
          })
          .filter(Boolean)
          .join("; ");
      }

      let splitType = "equal";
      if (e.splitMethod === "UNEQUAL") splitType = "unequal";
      if (e.splitMethod === "PERCENTAGE") splitType = "percentage";
      if (e.splitMethod === "SHARES") splitType = "share";

      rows.push([
        formatDate(e.createdAt),
        escapeCSV(e.title),
        escapeCSV(
          e.paidBy?.name ||
            group.members.find((m: any) => m.userId === e.paidByUserId)?.user
              ?.name ||
            "",
        ),
        (e.totalAmount / 100).toString(),
        "INR",
        splitType,
        escapeCSV(splitWithNames),
        escapeCSV(splitDetails),
        escapeCSV(e.description || ""),
        e.createdAt, // keep original date string for sorting
      ]);
    }

    // Format settlements
    for (const s of settlements) {
      rows.push([
        formatDate(s.createdAt),
        escapeCSV(
          s.note ||
            `${s.paidBy?.name || group.members.find((m: any) => m.userId === s.paidByUserId)?.user?.name || ""} paid ${s.paidTo?.name || group.members.find((m: any) => m.userId === s.paidToUserId)?.user?.name || ""} back`,
        ),
        escapeCSV(
          s.paidBy?.name ||
            group.members.find((m: any) => m.userId === s.paidByUserId)?.user
              ?.name ||
            "",
        ),
        (s.amount / 100).toString(),
        "INR",
        "", // empty split_type for settlements
        escapeCSV(
          s.paidTo?.name ||
            group.members.find((m: any) => m.userId === s.paidToUserId)?.user
              ?.name ||
            "",
        ),
        "", // empty split_details
        escapeCSV(s.note || ""),
        s.createdAt, // keep original date string for sorting
      ]);
    }

    // Sort rows by date ascending (chronological order)
    rows.sort((a, b) => new Date(a[9]!).getTime() - new Date(b[9]!).getTime());

    // Generate CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.slice(0, 9).join(",")),
    ].join("\n");

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${group.name}_expenses_export.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        onImportCSV={() => setImportOpen(true)}
        onExportCSV={handleExportCSV}
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
      <CSVImportDialog
        groupId={groupId}
        members={group.members}
        existingExpenses={expenses}
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportComplete={handleRefresh}
      />
    </div>
  );
}
