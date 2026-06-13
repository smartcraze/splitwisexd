"use client";

import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconScale,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardSummaryProps {
  totalBalance: number;
  youOwe: number;
  youAreOwed: number;
}

export function DashboardSummary({
  totalBalance,
  youOwe,
  youAreOwed,
}: DashboardSummaryProps) {
  const getBalanceColor = (bal: number) => {
    if (bal > 0) return "text-emerald-500 dark:text-emerald-400";
    if (bal < 0) return "text-rose-500 dark:text-rose-400";
    return "text-muted-foreground";
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Balance Card */}
      <Card className="bg-card border-border shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Balance
          </CardTitle>
          <IconScale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-extrabold tracking-tight ${getBalanceColor(totalBalance)}`}
          >
            {totalBalance >= 0 ? "+" : ""}₹{totalBalance.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalBalance > 0
              ? "Overall, you are owed money"
              : totalBalance < 0
                ? "Overall, you owe money to others"
                : "You are fully settled up!"}
          </p>
        </CardContent>
      </Card>

      {/* You Owe Card */}
      <Card className="bg-card border-border shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            You Owe
          </CardTitle>
          <IconArrowDownLeft className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold tracking-tight text-rose-500 dark:text-rose-400">
            ₹{youOwe.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total debts you need to settle
          </p>
        </CardContent>
      </Card>

      {/* You Are Owed Card */}
      <Card className="bg-card border-border shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            You Are Owed
          </CardTitle>
          <IconArrowUpRight className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold tracking-tight text-emerald-500 dark:text-emerald-400">
            ₹{youAreOwed.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total amount others owe you
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
