import { Skeleton } from "@/components/ui/skeleton"

export default function PersonDetailsLoading() {
  return (
    <div className="min-h-screen">
      <div className="relative w-full overflow-hidden">
        <Skeleton className="absolute inset-0 h-[500px]" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-20 w-full max-w-2xl mb-6" />
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
