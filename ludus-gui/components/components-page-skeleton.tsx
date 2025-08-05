import { Skeleton } from "@/components/ui/skeleton"

export function ComponentsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with toggle and search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Grid of component cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}