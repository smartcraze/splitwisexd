"use client";

import { Plus, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

export function CreateGroupModal({ onGroupCreated }: { onGroupCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (trimmed && !memberEmails.includes(trimmed) && trimmed.includes("@")) {
      setMemberEmails([...memberEmails, trimmed]);
      setEmailInput("");
    }
  };

  const removeEmail = (index: number) => {
    setMemberEmails(memberEmails.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.createGroup({ name, description, memberEmails });
      setName("");
      setDescription("");
      setMemberEmails([]);
      onGroupCreated();
      setOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>Create a new shared space for tracking and splitting expenses.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && <div className="text-xs bg-destructive/10 text-destructive p-3 rounded">{error}</div>}
          <div className="space-y-1">
            <Label htmlFor="group-name">Group Name</Label>
            <Input id="group-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Trip to Ladakh, Flat 304, etc." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a short description (optional)" />
          </div>
          <div className="space-y-2">
            <Label>Invite Members (by Email)</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEmail();
                  }
                }}
              />
              <Button type="button" size="icon" onClick={addEmail} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto">
              {memberEmails.map((email, idx) => (
                <div key={email} className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full border border-border">
                  <span>{email}</span>
                  <button type="button" onClick={() => removeEmail(idx)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

