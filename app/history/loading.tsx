import { Skeleton } from "@/components/ui/skeleton"

export default function HistoryLoading() {
  return (
    <div className="min-h-screen">
      <div className="relative w-full overflow-hidden bg-linear-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl border bg-card">
              <Skeleton className="w-32 h-20 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="size-10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
