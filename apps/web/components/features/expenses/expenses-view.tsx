"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  Receipt,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { ExpensesSkeleton } from "./expenses-skeleton";

const SPLIT_LABELS: Record<string, string> = {
  EQUAL: "Equal",
  UNEQUAL: "Unequal",
  PERCENTAGE: "Percentage",
  SHARES: "Shares",
};

const SPLIT_COLORS: Record<string, string> = {
  EQUAL: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  UNEQUAL:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  PERCENTAGE:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  SHARES:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

interface ExpenseRow {
  id: string;
  title: string;
  description?: string | null;
  totalAmount: number;
  splitMethod: string;
  groupId: string;
  groupName?: string;
  paidBy: { name: string };
  createdAt: string;
}

export function ExpensesView() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("ALL");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const groups = await api.getGroups();
        const all: ExpenseRow[] = [];
        await Promise.all(
          groups.map(async (g: any) => {
            const exps = await api.getExpenses(g.id);
            exps.forEach((e: any) => all.push({ ...e, groupName: g.name }));
          }),
        );
        all.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setExpenses(all);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return <ExpensesSkeleton />;
  }

  const splitMethods = ["ALL", "EQUAL", "UNEQUAL", "PERCENTAGE", "SHARES"];

  const filtered = expenses.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.groupName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      e.paidBy.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterMethod === "ALL" || e.splitMethod === filterMethod;
    return matchSearch && matchFilter;
  });

  const fmt = (n: number) =>
    `₹${(n / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">All Expenses</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {expenses.length} expense{expenses.length !== 1 ? "s" : ""} across all
          groups
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses, groups, people…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
          {splitMethods.map((m) => (
            <Button
              key={m}
              size="sm"
              variant={filterMethod === m ? "default" : "outline"}
              onClick={() => setFilterMethod(m)}
              className={`h-8 text-xs font-semibold ${filterMethod === m ? "bg-primary text-primary-foreground" : ""}`}
            >
              {m === "ALL" ? "All" : SPLIT_LABELS[m]}
            </Button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10">
            <Receipt className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-bold text-lg">No expenses found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search || filterMethod !== "ALL"
                ? "Try adjusting your search or filter."
                : "Add an expense inside any group to see it here."}
            </p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.map((expense, idx) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.04 }}
            className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group"
          >
            {/* Icon */}
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/20 text-rose-600 shrink-0">
              <Receipt className="h-4 w-4" />
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm truncate">
                  {expense.title}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${SPLIT_COLORS[expense.splitMethod] ?? ""}`}
                >
                  {SPLIT_LABELS[expense.splitMethod]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paid by{" "}
                <span className="font-medium">{expense.paidBy.name}</span>
                {expense.groupName && (
                  <>
                    {" "}
                    · in{" "}
                    <Link
                      href={`/dashboard/groups/${expense.groupId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {expense.groupName}
                    </Link>
                  </>
                )}
              </p>
            </div>

            {/* Amount + date */}
            <div className="flex flex-col items-end shrink-0 gap-0.5">
              <span className="text-base font-bold">
                {fmt(expense.totalAmount)}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(expense.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Arrow link */}
            <Link href={`/dashboard/groups/${expense.groupId}`}>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
