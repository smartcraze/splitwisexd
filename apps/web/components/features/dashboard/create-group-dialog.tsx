"use client";

import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchApi } from "@/lib/api";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddEmail = () => {
    if (!emailInput) return;
    const email = emailInput.trim().toLowerCase();
    if (emails.includes(email)) return toast.error("Email already added");
    setEmails([...emails, email]);
    setEmailInput("");
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Group name is required");
    setLoading(true);
    try {
      await fetchApi("/groups", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          memberEmails: emails,
        }),
      });
      toast.success("Group created successfully!");
      setName("");
      setDescription("");
      setEmails([]);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Setup a shared expense ledger space.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="gname">Group Name</Label>
            <Input
              id="gname"
              placeholder="e.g. Summer Vacation, Flat 2B"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="gdesc">Description</Label>
            <Input
              id="gdesc"
              placeholder="e.g. Shared expenses for household"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <Label>Invite Members (Emails)</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="flatmate@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddEmail}
                disabled={loading}
                className="cursor-pointer border-border"
              >
                <IconPlus size={18} />
              </Button>
            </div>
            {emails.length > 0 && (
              <div className="mt-2 space-y-1 max-h-24 overflow-y-auto border border-border rounded-xl p-2 bg-muted/30">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="flex justify-between items-center text-xs px-2 py-1 bg-card rounded-md border border-border"
                  >
                    <span className="truncate">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="text-destructive hover:scale-105 transition-transform"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer"
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
