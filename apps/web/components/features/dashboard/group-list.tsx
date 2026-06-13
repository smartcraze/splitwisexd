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
  const getGroupTheme = (name: string, desc = "") => {
    const text = `${name} ${desc}`.toLowerCase();
    if (
      /home|flat|electricity|rent|house|room|roommate|stay|apart/i.test(text)
    ) {
      return {
        name: "Flat group",
        bg: "bg-[var(--group-flat-bg)] border-[var(--group-flat-border)]",
        text: "text-[var(--group-flat-text)]",
        image:
          "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80",
        tagline: "Rent, utilities, and roommates",
        kanji: "家",
      };
    }
    if (
      /dinner|food|restaurant|ramen|sushi|cafe|party|lunch|drink|pub|bar/i.test(
        text,
      )
    ) {
      return {
        name: "Food group",
        bg: "bg-[var(--group-food-bg)] border-[var(--group-food-border)]",
        text: "text-[var(--group-food-text)]",
        image:
          "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
        tagline: "Dining out, Izakayas, and food runs",
        kanji: "食",
      };
    }
    if (
      /trip|travel|vacation|dollar|USD|outing|gate|trek|flight|train|bus|car|mountain/i.test(
        text,
      )
    ) {
      return {
        name: "Travel group",
        bg: "bg-[var(--group-travel-bg)] border-[var(--group-travel-border)]",
        text: "text-[var(--group-travel-text)]",
        image:
          "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&auto=format&fit=crop&q=80",
        tagline: "Flights, stays, and activities",
        kanji: "旅",
      };
    }
    return {
      name: "General group",
      bg: "bg-[var(--group-general-bg)] border-[var(--group-general-border)]",
      text: "text-[var(--group-general-text)]",
      image:
        "https://images.unsplash.com/photo-1512427691650-15fcce1dc7b1?w=600&auto=format&fit=crop&q=80",
      tagline: "Shared bills and projects",
      kanji: "倶",
    };
  };

  const renderHanko = (kanji: string, settled = false) => {
    const text = settled ? "済" : kanji;
    return (
      <div
        className={`rotate-[-8deg] shrink-0 select-none transition-transform hover:rotate-0 ${settled ? "absolute top-3 right-3 scale-105" : ""}`}
      >
        <svg
          width="34"
          height="34"
          viewBox="0 0 34 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <title>{settled ? "Settled Stamp" : `${kanji} Stamp`}</title>
          <circle
            cx="17"
            cy="17"
            r="14"
            stroke="var(--crimson)"
            strokeWidth="1.8"
            strokeDasharray="30 1 12 0.5 20 1"
            className="opacity-90"
          />
          <circle
            cx="17"
            cy="17"
            r="11"
            stroke="var(--crimson)"
            strokeWidth="0.8"
            className="opacity-80"
          />
          <text
            x="17"
            y="21"
            fill="var(--crimson)"
            fontSize="9"
            fontWeight="950"
            textAnchor="middle"
            className="font-serif"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            {text}
          </text>
        </svg>
      </div>
    );
  };

  const getBalanceText = (net: number) => {
    if (net > 0)
      return {
        text: `owed ₹${net.toLocaleString()}`,
        color: "text-emerald-500 font-bold",
      };
    if (net < 0)
      return {
        text: `owe ₹${Math.abs(net).toLocaleString()}`,
        color: "text-rose-500 font-bold",
      };
    return { text: "settled up", color: "text-muted-foreground font-medium" };
  };

  const featuredGroup = groups[0];
  const featuredTheme = featuredGroup
    ? getGroupTheme(featuredGroup.groupName)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Ledger Groups</h2>
        <Button
          onClick={onCreateOpen}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 px-4 rounded-xl cursor-pointer"
        >
          New Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card className="bg-card border-dashed border-2 border-border p-8 text-center rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center space-y-3 pt-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <IconUsers size={24} />
            </div>
            <h3 className="font-bold text-lg">No groups yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Create a group to start sharing expenses in your circle.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((group) => {
              const theme = getGroupTheme(group.groupName);
              const balanceInfo = getBalanceText(group.netBalance);
              const isSettled = group.netBalance === 0;

              return (
                <Link
                  key={group.groupId}
                  href={`/dashboard/groups/${group.groupId}`}
                >
                  <Card
                    className={`group cursor-pointer transition-all duration-200 border rounded-2xl relative overflow-hidden ${theme.bg} hover:shadow-md hover:scale-[1.01] h-full flex flex-col justify-between`}
                  >
                    <CardHeader className="pb-3 pt-4 flex flex-row items-start justify-between space-y-0">
                      <div className="space-y-1 pr-10">
                        <CardTitle className="font-extrabold text-base leading-snug group-hover:text-primary transition-colors">
                          {group.groupName}
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase tracking-wider font-mono opacity-80">
                          {theme.name}
                        </CardDescription>
                      </div>
                      {!isSettled
                        ? renderHanko(theme.kanji)
                        : renderHanko(theme.kanji, true)}
                    </CardHeader>
                    <CardContent className="pt-0 flex items-center justify-between border-t border-border/30 mt-1 py-3 bg-background/30">
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span>Status:</span>
                        <span className={balanceInfo.color}>
                          {balanceInfo.text}
                        </span>
                      </div>
                      <IconArrowRight
                        size={16}
                        className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                      />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {featuredGroup && featuredTheme && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground">
                  Featured {featuredTheme.name}
                </span>
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-mono font-bold">
                  New
                </span>
              </div>
              <Link href={`/dashboard/groups/${featuredGroup.groupId}`}>
                <Card className="bg-card border-border border rounded-3xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="relative h-44 w-full bg-muted overflow-hidden">
                    <img
                      src={featuredTheme.image}
                      alt={featuredGroup.groupName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h4 className="text-lg font-extrabold truncate leading-tight">
                        {featuredGroup.groupName}
                      </h4>
                      <p className="text-xs opacity-90 truncate font-mono">
                        {featuredTheme.tagline}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-muted/40 border border-border/40 rounded-xl p-2">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold block mb-0.5">
                          Members
                        </span>
                        <span className="font-extrabold text-foreground">
                          6
                        </span>
                      </div>
                      <div className="bg-muted/40 border border-border/40 rounded-xl p-2">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold block mb-0.5">
                          Owed
                        </span>
                        <span className="font-extrabold text-emerald-500">
                          {featuredGroup.netBalance > 0
                            ? `+₹${featuredGroup.netBalance}`
                            : "₹0"}
                        </span>
                      </div>
                      <div className="bg-muted/40 border border-border/40 rounded-xl p-2">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold block mb-0.5">
                          Due
                        </span>
                        <span className="font-extrabold text-rose-500">
                          {featuredGroup.netBalance < 0
                            ? `-₹${Math.abs(featuredGroup.netBalance)}`
                            : "₹0"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
