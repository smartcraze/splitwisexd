import React, { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { AppLayout } from "@/components/features/layout/app-layout";
import { CommentsSection } from "@/components/features/comments/comments-section";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Info, Receipt, User } from "lucide-react";
import Link from "next/link";
import { prisma } from "@repo/db";

type Props = { params: Promise<{ id: string; expenseId: string }> };

export default function ExpensePage({ params }: Props) {
  return (
    <AppLayout>
      <Suspense fallback={
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
      }>
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
          <Link href={`/dashboard/groups/${groupId}`} className="text-primary hover:underline mt-2 block">
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 pb-2">
        <Link href={`/dashboard/groups/${groupId}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-sm font-semibold text-muted-foreground">
          Back to Group Expenses
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Details card */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-5">
          <div>
            <span className="text-[10px] bg-secondary text-secondary-foreground font-bold tracking-wider uppercase px-2 py-0.5 rounded">
              {expense.splitMethod} Split
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-2 text-foreground">
              {expense.title}
            </h1>
            {expense.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {expense.description}
              </p>
            )}
          </div>

          <div className="space-y-3.5 pt-3 border-t border-border/60">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4 shrink-0" />
              <span>
                Total Amount:{" "}
                <span className="font-bold text-foreground">
                  {formatCurrency(expense.totalAmount)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span>
                Paid by:{" "}
                <span className="font-semibold text-foreground">
                  {expense.paidBy.name}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                Recorded:{" "}
                <span className="text-foreground">
                  {new Date(expense.createdAt).toLocaleDateString()}
                </span>
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-border/60">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <Info className="h-4 w-4 text-primary" /> Splits Breakdown
            </h3>
            <div className="divide-y divide-border/40 text-xs">
              {expense.participants.map((p: any) => (
                <div key={p.id} className="flex justify-between py-2 text-muted-foreground">
                  <span className="font-medium text-foreground">{p.user.name}</span>
                  <div className="text-right">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(p.owedAmount)}
                    </span>
                    {expense.splitMethod === "PERCENTAGE" && p.percentage && (
                      <span className="text-[10px] block opacity-75">{p.percentage}%</span>
                    )}
                    {expense.splitMethod === "SHARES" && p.shares && (
                      <span className="text-[10px] block opacity-75">{p.shares} shares</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments */}
        <CommentsSection expenseId={expenseId} currentUserId={user.id} />
      </div>
    </div>
  );
}
