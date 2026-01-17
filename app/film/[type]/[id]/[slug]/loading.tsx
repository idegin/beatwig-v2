import { Skeleton } from "@/components/ui/skeleton"

export default function FilmDetailsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />

        <div className="relative h-full container mx-auto px-4 flex items-end pb-16">
          <div className="flex flex-col md:flex-row gap-8 items-end md:items-end w-full">
            <Skeleton className="hidden md:block shrink-0 w-[200px] lg:w-[280px] aspect-[2/3] rounded-xl" />

            <div className="flex-1 space-y-4 pb-4 w-full">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              <Skeleton className="h-12 w-3/4 max-w-xl" />
              <Skeleton className="h-5 w-1/2 max-w-sm" />

              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>

              <div className="space-y-2 max-w-2xl">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <Skeleton className="h-12 w-36 rounded-lg" />
                <Skeleton className="h-12 w-32 rounded-lg" />
                <Skeleton className="h-12 w-28 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-16">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-10 w-[200px] rounded-md" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shrink-0 w-[200px]">
                <Skeleton className="aspect-video rounded-lg" />
                <div className="mt-2 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-[200px] rounded-xl" />
        </div>

        <div className="space-y-6">
          <Skeleton className="h-7 w-32" />
          <div className="flex gap-2 mb-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-md" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-video rounded-lg" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Skeleton className="h-7 w-28" />
          <div className="flex gap-4 overflow-hidden pb-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="shrink-0 w-[140px] text-center">
                <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto mt-3" />
                <Skeleton className="h-3 w-16 mx-auto mt-1" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Skeleton className="h-7 w-24" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto mt-2" />
                <Skeleton className="h-3 w-16 mx-auto mt-1" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card/30 rounded-xl p-5 border border-border/30">
                  <div className="flex items-start gap-4">
                    <Skeleton className="size-12 rounded-full shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card/40 rounded-2xl border border-border/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-4 border-b border-border/50">
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
                <div className="space-y-3 pt-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-border/30 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-32" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-7 w-40" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shrink-0 w-[180px]">
                <Skeleton className="aspect-[2/3] rounded-xl" />
                <Skeleton className="h-4 w-3/4 mt-3" />
                <Skeleton className="h-3 w-1/2 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
