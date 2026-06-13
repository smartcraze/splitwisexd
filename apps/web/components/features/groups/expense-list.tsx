"use client";

import {
  IconEdit,
  IconMessageCircle,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpenseParticipant {
  userId: string;
  owedAmount: number;
  user: { name: string };
}

interface Expense {
  id: string;
  title: string;
  description: string | null;
  totalAmount: number;
  createdAt: string;
  paidByUserId: string;
  paidBy: { id: string; name: string };
  participants: ExpenseParticipant[];
}

interface ExpenseListProps {
  expenses: Expense[];
  members: { userId: string; user: { name: string } }[];
  currentUserId: string;
  onSelectExpense: (expense: Expense) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => Promise<void>;
}

export function ExpenseList({
  expenses,
  members,
  currentUserId,
  onSelectExpense,
  onEditExpense,
  onDeleteExpense,
}: ExpenseListProps) {
  const [search, setSearch] = useState("");
  const [filterMember, setFilterMember] = useState("all");

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(search.toLowerCase()) ||
      (exp.description?.toLowerCase().includes(search.toLowerCase()) ?? false);

    if (filterMember === "all") return matchesSearch;
    const isPayer = exp.paidByUserId === filterMember;
    const isParticipant = exp.participants.some(
      (p) => p.userId === filterMember,
    );
    return matchesSearch && (isPayer || isParticipant);
  });

  const getMemberShareText = (exp: Expense, memberId: string) => {
    const pRecord = exp.participants.find((p) => p.userId === memberId);
    const owed = pRecord ? pRecord.owedAmount : 0;
    const paid = exp.paidByUserId === memberId ? exp.totalAmount : 0;
    const net = paid - owed;

    const memberName =
      memberId === currentUserId
        ? "You"
        : members.find((m) => m.userId === memberId)?.user.name || "Member";

    if (paid > 0 && owed > 0) {
      return `${memberName} paid ₹${paid.toLocaleString()} and owe ₹${owed.toLocaleString()} (Net: +₹${net.toLocaleString()})`;
    }
    if (paid > 0) {
      return `${memberName} paid ₹${paid.toLocaleString()} (Net: +₹${net.toLocaleString()})`;
    }
    if (owed > 0) {
      return `${memberName} owe ₹${owed.toLocaleString()} (Net: -₹${owed.toLocaleString()})`;
    }
    return `${memberName} were not involved`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-border"
          />
        </div>
        <Select value={filterMember} onValueChange={setFilterMember}>
          <SelectTrigger className="w-full sm:w-[200px] border-border bg-card">
            <SelectValue placeholder="Filter by member" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Members</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.userId} value={m.userId}>
                {m.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
            No expenses found.
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <Card
              key={exp.id}
              className="bg-card border-border hover:border-primary/50 transition-colors shadow-sm"
            >
              <CardContent className="p-4 flex justify-between items-center gap-4">
                <div
                  className="space-y-1.5 flex-1 min-w-0 cursor-pointer"
                  onClick={() => onSelectExpense(exp)}
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm truncate text-foreground group-hover:text-primary">
                      {exp.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                      {new Date(exp.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {exp.description || "No description"}
                  </p>
                  <p className="text-xs font-bold text-primary">
                    {getMemberShareText(
                      exp,
                      filterMember === "all" ? currentUserId : filterMember,
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditExpense(exp)}
                    className="h-8 w-8 rounded-xl cursor-pointer text-muted-foreground hover:bg-muted"
                    title="Edit"
                  >
                    <IconEdit size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteExpense(exp.id)}
                    className="h-8 w-8 rounded-xl cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Delete"
                  >
                    <IconTrash size={15} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
