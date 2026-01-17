import { Skeleton } from "@/components/ui/skeleton"

export default function WatchlistLoading() {
  return (
    <div className="min-h-screen">
      <div className="relative w-full overflow-hidden">
        <Skeleton className="absolute inset-0 h-[400px]" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[2/3] rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
