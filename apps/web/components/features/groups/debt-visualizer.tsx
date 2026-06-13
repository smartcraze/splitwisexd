"use client";

import { motion } from "framer-motion";
import React from "react";

interface Debt {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

interface Balance {
  userId: string;
  name: string;
  netBalance: number;
}

interface DebtVisualizerProps {
  members: { user: { id: string; name: string } }[];
  balances: Balance[];
  debts: Debt[];
  onSettleDebt: (fromId: string, toId: string, amount: number) => void;
}

export function DebtVisualizer({
  members,
  balances,
  debts,
  onSettleDebt,
}: DebtVisualizerProps) {
  const width = 360;
  const height = 360;
  const cx = width / 2;
  const cy = height / 2;
  const r = 110;

  const nodePositions = React.useMemo(() => {
    const positions: Record<string, { x: number; y: number; angle: number }> =
      {};
    members.forEach((m, idx) => {
      const angle = (idx * 2 * Math.PI) / members.length - Math.PI / 2;
      positions[m.user.id] = {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        angle,
      };
    });
    return positions;
  }, [members, cx, cy, r]);

  const getNetBalance = (userId: string) => {
    return balances.find((b) => b.userId === userId)?.netBalance || 0;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-card border border-border p-6 rounded-xl shadow-sm relative overflow-hidden">
      <h3 className="font-bold text-lg mb-4 text-center">
        Interactive Debt Flow Map
      </h3>
      <div className="relative w-full max-w-[360px] aspect-square">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" />
            </marker>
          </defs>

          {/* Debt Flow Lines */}
          {debts.map((debt, idx) => {
            const start = nodePositions[debt.from];
            const end = nodePositions[debt.to];
            if (!start || !end) return null;

            return (
              <g
                key={`${debt.from}-${debt.to}-${idx}`}
                className="cursor-pointer"
                onClick={() => onSettleDebt(debt.from, debt.to, debt.amount)}
              >
                <title>{`${debt.fromName} owes ${debt.toName}: ₹${(debt.amount / 100).toFixed(2)} (Click to settle)`}</title>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="var(--primary)"
                  strokeWidth="3"
                  opacity="0.65"
                  markerEnd="url(#arrow)"
                  className="transition-all hover:stroke-[5] hover:opacity-100"
                />
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  opacity="0.8"
                  className="animate-[dash_1s_linear_infinite]"
                  style={{ strokeDashoffset: -20 }}
                />
                <rect
                  x={(start.x + end.x) / 2 - 25}
                  y={(start.y + end.y) / 2 - 10}
                  width="50"
                  height="20"
                  rx="4"
                  fill="var(--card)"
                  stroke="var(--border)"
                  strokeWidth="1"
                />
                <text
                  x={(start.x + end.x) / 2}
                  y={(start.y + end.y) / 2 + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="var(--foreground)"
                >
                  ₹{Math.round(debt.amount / 100)}
                </text>
              </g>
            );
          })}

          {/* Member Nodes */}
          {members.map((member) => {
            const pos = nodePositions[member.user.id];
            if (!pos) return null;
            const net = getNetBalance(member.user.id);
            const isOwed = net > 0;
            const isOwer = net < 0;

            return (
              <g key={member.user.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="22"
                  fill="var(--secondary)"
                  stroke="var(--border)"
                  strokeWidth="2"
                />
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="var(--foreground)"
                >
                  {getInitials(member.user.name)}
                </text>
                <text
                  x={pos.x}
                  y={pos.y - 28}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="var(--foreground)"
                >
                  {member.user.name.split(" ")[0]}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 36}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={
                    isOwed
                      ? "oklch(0.627 0.194 149.21)"
                      : isOwer
                        ? "oklch(0.609 0.126 12.18)"
                        : "var(--muted-foreground)"
                  }
                >
                  {net === 0
                    ? "Settled"
                    : `${net > 0 ? "+" : "-"}₹${Math.abs(Math.round(net / 100))}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Dotted lines represent debt direction. Click any debt box to quickly
        record a settlement.
      </p>
    </div>
  );
}
