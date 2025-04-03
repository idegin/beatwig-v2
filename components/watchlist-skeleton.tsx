import { Skeleton } from "@/components/ui/skeleton"

export function WatchlistSkeleton() {
    return (
        <div>
            <div className="flex gap-2 mb-8">
                <Skeleton className="h-10 w-20 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-28 rounded-md" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
            </div>
        </div>
    )
}

