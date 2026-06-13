import { prisma } from "@repo/db";
import { ArrowLeft, Calendar, Info, Receipt, User } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import React, { Suspense } from "react";
import { CommentsSection } from "@/components/features/comments/comments-section";
import { AppLayout } from "@/components/features/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/session";

type Props = { params: Promise<{ id: string; expenseId: string }> };

export default function ExpensePage({ params }: Props) {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 items-start">
              <Skeleton className="h-[400px] w-full rounded-2xl" />
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
          </div>
        }
      >
        <ExpensePageDynamic params={params} />
      </Suspense>
    </AppLayout>
  );
}

async function ExpensePageDynamic({ params }: Props) {
  const { id: groupId, expenseId } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // Security: Check if user belongs to the group of this expense
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: user.id,
      },
    },
  });

  if (!membership) {
    redirect("/dashboard/groups");
  }

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      paidBy: { select: { name: true } },
      participants: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!expense || expense.groupId !== groupId) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <div>
          <h2 className="text-xl font-bold">Expense not found</h2>
          <Link
            href={`/dashboard/groups/${groupId}`}
            className="text-primary hover:underline mt-2 block"
          >
            Back to Group
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 pb-2">
        <Link href={`/dashboard/groups/${groupId}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
          </Button>
        </Link>
        <span className="text-sm font-semibold text-muted-foreground">
          Back to Group Expenses
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-12 items-start">
        {/* Details card */}
        <div className="bg-card border border-border/80 p-6 md:p-8 rounded-[24px] shadow-sm space-y-6 md:col-span-7">
          <div className="space-y-3">
            <span className="inline-block text-[10px] bg-rose-50 text-primary border border-primary/15 font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
              {expense.splitMethod} Split
            </span>
            <h1 className="text-3xl font-black tracking-tight text-foreground leading-none">
              {expense.title}
            </h1>
            {expense.description && (
              <p className="text-sm text-muted-foreground">
                {expense.description}
              </p>
            )}
          </div>

          {/* 3-column stats row */}
          <div className="bg-primary/5 p-4 rounded-2xl grid grid-cols-3 gap-3 border border-primary/10">
            {/* Total Amount */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground/80 tracking-wider block">
                Total Amount
              </span>
              <span className="text-lg font-black text-primary block leading-none">
                {formatCurrency(expense.totalAmount)}
              </span>
            </div>
            {/* Paid By */}
            <div className="space-y-1 min-w-0">
              <span className="text-[9px] uppercase font-bold text-muted-foreground/80 tracking-wider block">
                Paid by
              </span>
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="h-5.5 w-5.5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                  {expense.paidBy.name[0].toUpperCase()}
                </div>
                <span className="text-xs font-bold text-foreground truncate block leading-none">
                  {expense.paidBy.name}
                </span>
              </div>
            </div>
            {/* Recorded on */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground/80 tracking-wider block">
                Recorded on
              </span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground leading-none">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/75" />
                <span className="text-[11px] font-semibold">
                  {new Date(expense.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Splits Breakdown */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="h-3.5 w-3.5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-sm text-foreground">
                Splits Breakdown
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {expense.splitMethod === "EQUAL" &&
                `This expense is equally split between ${expense.participants.length} people.`}
              {expense.splitMethod === "PERCENTAGE" &&
                "This expense is split by custom percentages."}
              {expense.splitMethod === "SHARES" &&
                "This expense is split by weighted shares."}
              {expense.splitMethod === "UNEQUAL" &&
                "This expense is split by custom exact amounts."}
            </p>

            <div className="space-y-2 mt-1">
              {expense.participants.map((p: any) => {
                const initials = p.user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/40 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {initials}
                      </div>
                      <span className="font-semibold text-sm text-foreground">
                        {p.user.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-primary">
                        {formatCurrency(p.owedAmount)}
                      </span>
                      {expense.splitMethod === "PERCENTAGE" && p.percentage && (
                        <span className="text-[10px] block text-muted-foreground">
                          {p.percentage}%
                        </span>
                      )}
                      {expense.splitMethod === "SHARES" && p.shares && (
                        <span className="text-[10px] block text-muted-foreground">
                          {p.shares} shares
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fully settled up banner */}
          <div className="relative overflow-hidden bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-emerald-950">
                Fully settled up!
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                No one owes or is owed anything for this expense.
              </p>
            </div>

            <div
              className="absolute right-3 bottom-0 opacity-15 text-emerald-800 pointer-events-none"
              aria-hidden="true"
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 10h18" />
                <circle cx="12" cy="14" r="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="md:col-span-5">
          <CommentsSection expenseId={expenseId} currentUserId={user.id} />
        </div>
      </div>
    </div>
  );
}
