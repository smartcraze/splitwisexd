"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, CreditCard, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/features/auth/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { SettlementsSkeleton } from "./settlements-skeleton";

interface SettlementRow {
  id: string;
  amount: number;
  note?: string | null;
  createdAt: string;
  groupId: string;
  groupName?: string;
  paidBy: { name: string };
  paidTo: { name: string };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SettlementsView() {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState<SettlementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const groups = await api.getGroups();
        const all: SettlementRow[] = [];
        await Promise.all(
          groups.map(async (g: any) => {
            const s = await api.getSettlements(g.id);
            s.forEach((item: any) => all.push({ ...item, groupName: g.name }));
          }),
        );
        all.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setSettlements(all);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return <SettlementsSkeleton />;
  }

  const fmt = (n: number) =>
    `₹${(n / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const filtered = settlements.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.paidBy.name.toLowerCase().includes(q) ||
      s.paidTo.name.toLowerCase().includes(q) ||
      (s.groupName ?? "").toLowerCase().includes(q) ||
      (s.note ?? "").toLowerCase().includes(q)
    );
  });

  // Aggregate: total you've paid vs received
  const totalPaid = settlements
    .filter((s) => s.paidBy.name === user?.name)
    .reduce((sum, s) => sum + s.amount, 0);
  const totalReceived = settlements
    .filter((s) => s.paidTo.name === user?.name)
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settlements</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Complete payment history across all groups
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">
            You've Paid
          </p>
          <p className="text-2xl font-extrabold mt-1 text-rose-600">
            {fmt(totalPaid)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            across {settlements.length} settlement
            {settlements.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">
            You've Received
          </p>
          <p className="text-2xl font-extrabold mt-1 text-emerald-600">
            {fmt(totalReceived)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            from others settling with you
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, group, note…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20">
            <CreditCard className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-lg">No settlements yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {search
                ? "Try a different keyword."
                : "When you settle debts inside a group, they'll appear here."}
            </p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.map((s, idx) => {
          const isPayer = s.paidBy.name === user?.name;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all"
            >
              {/* Icon */}
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>

              {/* Avatars + names */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-rose-100 text-rose-700 text-xs font-bold">
                    {initials(s.paidBy.name)}
                  </AvatarFallback>
                </Avatar>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">
                    {initials(s.paidTo.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    <span className={isPayer ? "text-rose-600" : ""}>
                      {s.paidBy.name}
                    </span>
                    {" → "}
                    <span className={!isPayer ? "text-emerald-600" : ""}>
                      {s.paidTo.name}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.groupName && (
                      <Link
                        href={`/dashboard/groups/${s.groupId}`}
                        className="text-primary hover:underline"
                      >
                        {s.groupName}
                      </Link>
                    )}
                    {s.note && ` · "${s.note}"`}
                    {" · "}
                    {new Date(s.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div className="shrink-0 text-right">
                <span className="text-base font-bold text-emerald-600">
                  {fmt(s.amount)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
