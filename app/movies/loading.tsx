import { Skeleton } from "@/components/ui/skeleton"

export default function MoviesLoading() {
  return (
    <div className="min-h-screen">
      <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
        <Skeleton className="absolute inset-0" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-12">
        {Array.from({ length: 4 }).map((_, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>

            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, cardIndex) => (
                <Skeleton
                  key={cardIndex}
                  className="flex-shrink-0 aspect-[2/3] w-[200px] rounded-xl"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
