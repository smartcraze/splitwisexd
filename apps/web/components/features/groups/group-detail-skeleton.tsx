import { Skeleton } from "@/components/ui/skeleton";

export function GroupDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Grid structure */}
      <div className="grid gap-6 md:grid-cols-3 items-start">
        {/* Main tabs column */}
        <div className="md:col-span-2 space-y-6 bg-card border border-border p-6 rounded-xl shadow-sm">
          {/* Tabs trigger */}
          <div className="bg-muted border border-border rounded-lg p-1 grid grid-cols-2 mb-4 h-10 w-full">
            <Skeleton className="h-full rounded-md" />
            <Skeleton className="h-full rounded-md" />
          </div>
          {/* List of items */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-background rounded-xl border border-border"
              >
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4.5 w-48" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-12 ml-auto" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          {/* Debt visualizer skeleton */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>

          {/* Members skeleton */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
            <Skeleton className="h-5 w-24" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-3.5 w-12 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
