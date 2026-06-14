"use client";

import { ArrowLeft, CreditCard, PlusCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface GroupHeaderProps {
  name: string;
  description?: string | null;
  onAddExpense: () => void;
  onSettleUp: () => void;
  onAddMember: () => void;
}

export function GroupHeader({
  name,
  description,
  onAddExpense,
  onSettleUp,
  onAddMember,
}: GroupHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 pb-6 border-b border-border">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">{name}</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-7">
          {description || "No description provided."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 sm:self-end ml-7 md:ml-0">
        <Button
          onClick={onAddMember}
          variant="outline"
          className="border-border text-foreground hover:bg-muted font-semibold"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Add Member
        </Button>
        <Button
          onClick={onSettleUp}
          variant="outline"
          className="border-border text-foreground hover:bg-muted font-semibold"
        >
          <CreditCard className="mr-2 h-4 w-4" /> Settle Up
        </Button>
        <Button
          onClick={onAddExpense}
          className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>
    </div>
  );
}
