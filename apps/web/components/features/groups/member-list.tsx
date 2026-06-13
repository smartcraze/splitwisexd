"use client";

import { IconPlus, IconTrash, IconUser } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchApi } from "@/lib/api";

interface Member {
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

interface MemberListProps {
  groupId: string;
  members: Member[];
  onRefresh: () => void;
  currentUserId: string;
}

export function MemberList({
  groupId,
  members,
  onRefresh,
  currentUserId,
}: MemberListProps) {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setLoading(true);
    try {
      await fetchApi(`/groups/${groupId}/members`, {
        method: "POST",
        body: JSON.stringify({ email: emailInput.trim().toLowerCase() }),
      });
      toast.success("Member added successfully");
      setEmailInput("");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setLoading(true);
    try {
      await fetchApi(`/groups/${groupId}/members/${userId}`, {
        method: "DELETE",
      });
      toast.success("Member removed successfully");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddMember} className="space-y-2">
        <Label htmlFor="add-email">Add Member by Email</Label>
        <div className="flex gap-2">
          <Input
            id="add-email"
            type="email"
            placeholder="flatmate@example.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            disabled={loading}
            required
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer shrink-0 flex items-center gap-1"
          >
            <IconPlus size={16} /> Add
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Group Members ({members.length})
        </h3>
        <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={member.user.avatarUrl || undefined} />
                  <AvatarFallback className="font-bold bg-primary/10 text-primary">
                    {member.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold">
                      {member.user.name}
                    </span>
                    {member.role === "ADMIN" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {member.user.email}
                  </span>
                </div>
              </div>

              {member.userId !== currentUserId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member.userId)}
                  disabled={loading}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
                  title="Remove Member"
                >
                  <IconTrash size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
