"use client";

import { Crown, UserMinus } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface GroupMembersProps {
  groupId: string;
  members: Member[];
  currentUserId: string;
  creatorId: string;
  onMemberRemoved: () => void;
}

export function GroupMembers({
  groupId,
  members,
  currentUserId,
  creatorId,
  onMemberRemoved,
}: GroupMembersProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (userId: string) => {
    setError(null);
    setLoadingId(userId);
    try {
      await api.removeMember(groupId, userId);
      onMemberRemoved();
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to remove member. They may have active balances.",
      );
    } finally {
      setLoadingId(null);
    }
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Group Members ({members.length})</h3>
      </div>

      {error && (
        <div className="text-xs bg-destructive/10 text-destructive p-2 rounded">
          {error}
        </div>
      )}

      <div className="divide-y divide-border/50 max-h-[300px] overflow-y-auto pr-1">
        {members.map((member) => {
          const { user } = member;
          const isCreator = user.id === creatorId;
          const isSelf = user.id === currentUserId;
          const canDelete =
            (currentUserId === creatorId && !isCreator) || isSelf;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 bg-secondary border border-border">
                  <AvatarFallback className="text-xs font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    {user.name}
                    {isSelf && (
                      <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded font-normal">
                        You
                      </span>
                    )}
                    {isCreator && (
                      <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>

              {canDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={loadingId !== null}
                  onClick={() => handleRemove(user.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
