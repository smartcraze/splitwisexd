import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export function FriendsSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-60" />
      </div>

      {/* Friends list */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border shadow-sm"
          >
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4.5 w-32" />
                <Skeleton className="h-3 w-44" />
                <Skeleton className="h-3.5 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-8 w-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
