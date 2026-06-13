"use client";

import { IconArrowRight, IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GroupSummary {
  groupId: string;
  groupName: string;
  netBalance: number;
  youOwe: number;
  youAreOwed: number;
}

interface GroupListProps {
  groups: GroupSummary[];
  onCreateOpen: () => void;
}

export function GroupList({ groups, onCreateOpen }: GroupListProps) {
  const getBalanceText = (net: number) => {
    if (net > 0)
      return {
        text: `you are owed ₹${net.toLocaleString()}`,
        color: "text-emerald-500 font-bold",
      };
    if (net < 0)
      return {
        text: `you owe ₹${Math.abs(net).toLocaleString()}`,
        color: "text-rose-500 font-bold",
      };
    return { text: "settled up", color: "text-muted-foreground font-medium" };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Your Groups</h2>
        <Button
          onClick={onCreateOpen}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 px-4 rounded-xl cursor-pointer"
        >
          Create Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card className="bg-card border-dashed border-2 border-border p-8 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-3 pt-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <IconUsers size={24} />
            </div>
            <h3 className="font-bold text-lg">No groups yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create a group to start sharing expenses for trips, flat utility
              bills, or projects.
            </p>
            <Button
              onClick={onCreateOpen}
              variant="outline"
              className="cursor-pointer border-border font-bold rounded-xl mt-2"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => {
            const balanceInfo = getBalanceText(group.netBalance);
            return (
              <Link
                key={group.groupId}
                href={`/dashboard/groups/${group.groupId}`}
              >
                <Card className="bg-card hover:bg-accent/40 border-border cursor-pointer transition-all duration-200 h-full group hover:shadow-md relative overflow-hidden">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1 pr-6">
                      <CardTitle className="font-bold text-base leading-snug group-hover:text-primary transition-colors">
                        {group.groupName}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-1">
                        Group expense ledger
                      </CardDescription>
                    </div>
                    <IconArrowRight
                      size={18}
                      className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-0.5"
                    />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span>Status:</span>
                      <span className={balanceInfo.color}>
                        {balanceInfo.text}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
