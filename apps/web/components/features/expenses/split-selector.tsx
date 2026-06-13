"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Member {
  user: { id: string; name: string };
}

interface ParticipantInput {
  userId: string;
  name: string;
  selected: boolean;
  value: string; // amount, percentage, or share weight
}

interface SplitSelectorProps {
  totalAmount: number; // in cents/paise
  splitMethod: "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARES";
  members: Member[];
  initialParticipants?: any[];
  onChange: (participants: any[]) => void;
}

export function SplitSelector({
  totalAmount,
  splitMethod,
  members,
  initialParticipants,
  onChange,
}: SplitSelectorProps) {
  const [participants, setParticipants] = useState<ParticipantInput[]>([]);

  useEffect(() => {
    const defaultParticipants = members.map((m) => {
      const existing = initialParticipants?.find((p) => p.userId === m.user.id);
      let initialVal = "1";
      if (splitMethod === "UNEQUAL") {
        initialVal = existing ? (existing.owedAmount / 100).toString() : "";
      } else if (splitMethod === "PERCENTAGE") {
        initialVal = existing?.percentage?.toString() || "";
      } else if (splitMethod === "SHARES") {
        initialVal = existing?.shares?.toString() || "1";
      }

      return {
        userId: m.user.id,
        name: m.user.name,
        selected: existing ? true : initialParticipants === undefined,
        value: initialVal,
      };
    });
    setParticipants(defaultParticipants);
  }, [members, splitMethod, initialParticipants]);

  const handleToggle = (idx: number) => {
    const updated = [...participants];
    if (updated[idx]) {
      updated[idx].selected = !updated[idx].selected;
      setParticipants(updated);
    }
  };

  const handleValueChange = (idx: number, val: string) => {
    const updated = [...participants];
    if (updated[idx]) {
      updated[idx].value = val;
      setParticipants(updated);
    }
  };

  // Recalculate outputs and bubble up on changes
  useEffect(() => {
    const selected = participants.filter((p) => p.selected);
    if (selected.length === 0) {
      onChange([]);
      return;
    }

    const output = selected.map((p) => {
      const numVal = Number.parseFloat(p.value) || 0;
      return {
        userId: p.userId,
        owedAmount: splitMethod === "UNEQUAL" ? Math.round(numVal * 100) : null,
        percentage: splitMethod === "PERCENTAGE" ? numVal : null,
        shares: splitMethod === "SHARES" ? Math.round(numVal) : null,
      };
    });

    onChange(output);
  }, [participants, splitMethod, onChange]);

  return (
    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
      <div className="text-xs font-semibold text-muted-foreground uppercase">
        Split Details
      </div>
      {participants.map((p, idx) => (
        <div
          key={p.userId}
          className="flex items-center justify-between gap-3 text-sm py-1.5 border-b border-border/40 last:border-0"
        >
          <label className="flex items-center gap-2 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={p.selected}
              onChange={() => handleToggle(idx)}
              className="rounded border-border text-primary focus:ring-ring"
            />
            <span>{p.name}</span>
          </label>

          {p.selected && splitMethod !== "EQUAL" && (
            <div className="flex items-center gap-1.5 w-24 shrink-0">
              <Input
                type="number"
                step="any"
                placeholder="0"
                value={p.value}
                onChange={(e) => handleValueChange(idx, e.target.value)}
                className="h-8 py-0.5 px-2 bg-background border-border text-xs text-right"
              />
              <span className="text-xs text-muted-foreground shrink-0 font-medium">
                {splitMethod === "UNEQUAL"
                  ? "₹"
                  : splitMethod === "PERCENTAGE"
                    ? "%"
                    : "sh"}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
