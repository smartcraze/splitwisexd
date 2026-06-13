"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Users2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/features/auth/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { FriendsSkeleton } from "./friends-skeleton";

interface Friend {
  userId: string;
  name: string;
  email: string;
  youOwe: number; // you owe them
  owesYou: number; // they owe you
  groupIds: string[];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function FriendsView() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const groups = await api.getGroups();
        // Aggregate per-person balances across all groups
        const friendMap = new Map<string, Friend>();

        await Promise.all(
          groups.map(async (g: any) => {
            const { debts } = await api.getBalances(g.id);
            for (const debt of debts ?? []) {
              const isOwer = debt.fromUser.id === user.id;
              const isPayer = debt.toUser.id === user.id;
              if (!isOwer && !isPayer) continue;

              const otherId = isOwer ? debt.toUser.id : debt.fromUser.id;
              const otherName = isOwer ? debt.toUser.name : debt.fromUser.name;
              const otherEmail = isOwer
                ? (debt.toUser.email ?? "")
                : (debt.fromUser.email ?? "");

              if (!friendMap.has(otherId)) {
                friendMap.set(otherId, {
                  userId: otherId,
                  name: otherName,
                  email: otherEmail,
                  youOwe: 0,
                  owesYou: 0,
                  groupIds: [],
                });
              }
              const f = friendMap.get(otherId)!;
              if (!f.groupIds.includes(g.id)) f.groupIds.push(g.id);
              if (isOwer) f.youOwe += debt.amount;
              else f.owesYou += debt.amount;
            }
          }),
        );

        setFriends(
          Array.from(friendMap.values()).sort(
            (a, b) => b.owesYou + b.youOwe - (a.owesYou + a.youOwe),
          ),
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return <FriendsSkeleton />;
  }

  const fmt = (n: number) =>
    `₹${(n / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Friends</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          People you share expenses with
        </p>
      </div>

      {/* Empty */}
      {friends.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10">
            <Users2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-bold text-lg">No friends with active balances</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Add members to a group and split expenses to see friend balances
              here.
            </p>
          </div>
          <Link href="/dashboard/groups">
            <Button className="bg-primary text-primary-foreground">
              View Groups
            </Button>
          </Link>
        </div>
      )}

      {/* Friends list */}
      <div className="space-y-3">
        {friends.map((friend, idx) => {
          const net = friend.owesYou - friend.youOwe;
          const isPositive = net > 0;
          const isNegative = net < 0;

          return (
            <motion.div
              key={friend.userId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all"
            >
              <Avatar className="h-11 w-11 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {initials(friend.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{friend.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {friend.email}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {friend.groupIds.length} shared group
                  {friend.groupIds.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Balances */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                {friend.owesYou > 0 && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <ArrowUpRight className="h-3 w-3" />
                    <span className="text-xs font-semibold">
                      {fmt(friend.owesYou)} owes you
                    </span>
                  </div>
                )}
                {friend.youOwe > 0 && (
                  <div className="flex items-center gap-1 text-rose-600">
                    <ArrowDownLeft className="h-3 w-3" />
                    <span className="text-xs font-semibold">
                      you owe {fmt(friend.youOwe)}
                    </span>
                  </div>
                )}
                <div
                  className={`text-base font-extrabold ${isPositive ? "text-emerald-600" : isNegative ? "text-rose-600" : "text-muted-foreground"}`}
                >
                  {isPositive ? "+" : ""}
                  {fmt(Math.abs(net))}
                </div>
              </div>

              {/* Go to group */}
              {friend.groupIds[0] && (
                <Link href={`/dashboard/groups/${friend.groupIds[0]}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    View
                  </Button>
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
