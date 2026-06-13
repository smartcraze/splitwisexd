"use client";

import React from "react";

interface SpendingChartProps {
  totalAmount: number;
}

const CATEGORIES = [
  { label: "Travel", color: "#E11D48", pct: 45 },
  { label: "Food", color: "#10B981", pct: 30 },
  { label: "Shopping", color: "#F59E0B", pct: 15 },
  { label: "Others", color: "#8B5CF6", pct: 10 },
] as const;

function DonutChart() {
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = 40;
  const strokeW = 16;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const segments = CATEGORIES.map((cat) => {
    const dash = (cat.pct / 100) * circumference;
    const seg = {
      ...cat,
      dashOffset: -offset,
      dashArray: `${dash} ${circumference - dash}`,
    };
    offset += dash;
    return seg;
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-[120px] h-[120px] -rotate-90"
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--muted)"
        strokeWidth={strokeW}
      />
      {segments.map((seg) => (
        <circle
          key={seg.label}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth={strokeW}
          strokeDasharray={seg.dashArray}
          strokeDashoffset={seg.dashOffset}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  );
}

export function SpendingChart({ totalAmount }: SpendingChartProps) {
  const fmt = (amount: number) =>
    `₹${(amount / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base">Spending Chart</h3>
        <span className="text-xs text-muted-foreground px-2.5 py-1 bg-muted rounded-lg">
          This Month
        </span>
      </div>

      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="relative shrink-0">
          <DonutChart />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-medium">
              Total
            </span>
            <span className="text-sm font-extrabold leading-tight">
              {fmt(totalAmount)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1">
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {cat.label}
                </span>
              </div>
              <span className="text-xs font-semibold">{cat.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        View Detailed Report
        <span className="text-xs">›</span>
      </button>
    </div>
  );
}
