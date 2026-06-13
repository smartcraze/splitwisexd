import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Overview stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-sm"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Two column grid */}
      <div className="flex gap-6 items-start">
        {/* Main Column */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden xl:flex flex-col gap-5 w-[300px] shrink-0">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-2 w-12" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 h-[200px]">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-end justify-center h-32 gap-3">
              <Skeleton className="h-16 w-8" />
              <Skeleton className="h-24 w-8" />
              <Skeleton className="h-20 w-8" />
              <Skeleton className="h-28 w-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
