import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export function GroupsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Search Input */}
      <Skeleton className="h-10 w-full rounded-xl" />

      {/* Grid of groups */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden h-[260px] flex flex-col justify-between"
          >
            <Skeleton className="h-36 w-full" />
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-end">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="border-t border-border mt-3 pt-3 flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        ))}
        {/* Placeholder for the create dashed card */}
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 h-[260px] flex flex-col items-center justify-center p-8 gap-3">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  );
}
