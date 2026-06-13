"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ExpenseParticipant {
  userId: string;
  owedAmount: number;
}

interface Expense {
  id: string;
  title: string;
  totalAmount: number;
  createdAt: string;
  participants: ExpenseParticipant[];
}

interface DashboardChartProps {
  expenses: Expense[];
  currentUserId: string;
}

export function DashboardChart({
  expenses,
  currentUserId,
}: DashboardChartProps) {
  // Aggregate expenses by week
  const getWeeklyData = () => {
    if (expenses.length === 0) {
      return [
        { name: "W1", personal: 0, group: 0 },
        { name: "W2", personal: 0, group: 0 },
        { name: "W3", personal: 0, group: 0 },
        { name: "W4", personal: 0, group: 0 },
      ];
    }

    const weeks = ["W4", "W3", "W2", "W1"]; // W1 is most recent
    const data = weeks.map((w, idx) => {
      const now = new Date();
      const startMs = now.getTime() - (idx + 1) * 7 * 24 * 60 * 60 * 1000;
      const endMs = now.getTime() - idx * 7 * 24 * 60 * 60 * 1000;

      let groupTotal = 0;
      let personalTotal = 0;

      for (const exp of expenses) {
        const expTime = new Date(exp.createdAt).getTime();
        if (expTime >= startMs && expTime < endMs) {
          groupTotal += exp.totalAmount;
          const userPart = exp.participants.find(
            (p) => p.userId === currentUserId,
          );
          if (userPart) {
            personalTotal += userPart.owedAmount;
          }
        }
      }

      return { name: w, personal: personalTotal, group: groupTotal };
    });

    return data.reverse();
  };

  const chartData = getWeeklyData();
  const chartConfig = {
    personal: { label: "Your Share (₹)", color: "var(--crimson)" },
    group: { label: "Group Total (₹)", color: "var(--muted-foreground)" },
  };

  return (
    <Card className="bg-card border-border shadow-sm overflow-hidden border relative">
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[var(--crimson)]" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center justify-between">
          <span>Weekly Spending Trend</span>
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-mono font-medium">
            Dynamic Trajectory
          </span>
        </CardTitle>
        <CardDescription className="text-xs">
          Weekly analysis of your personal shares vs overall group spending
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[180px] pt-4">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            data={chartData}
            margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPersonal" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--crimson)"
                  stopOpacity={0.3}
                />
                <stop offset="95%" stopColor="var(--crimson)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorGroup" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--muted-foreground)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="var(--muted-foreground)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="name"
              stroke="var(--muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Area
              type="monotone"
              dataKey="group"
              stroke="var(--muted-foreground)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGroup)"
            />
            <Area
              type="monotone"
              dataKey="personal"
              stroke="var(--crimson)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorPersonal)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
