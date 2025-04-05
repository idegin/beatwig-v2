import { Skeleton } from "@/components/ui/skeleton"

export function GenreDetailsSkeleton() {
    return (
        <>
            {/* Hero skeleton */}
            <div className="pt-16 pb-8 md:pt-24 md:pb-12">
                <div className="container">
                    <Skeleton className="h-12 w-1/3 mb-4" />
                    <Skeleton className="h-6 w-1/2 mb-8" />

                    <div className="flex gap-2 mb-6">
                        <Skeleton className="h-10 w-24 rounded-md" />
                        <Skeleton className="h-10 w-24 rounded-md" />
                    </div>
                </div>
            </div>

            {/* Content skeleton */}
            <div className="container py-8">
                <div className="flex justify-between items-center gap-4 mb-8">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-10 w-[200px]" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {Array.from({ length: 18 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>

                <div className="flex justify-center mt-12">
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                </div>
            </div>
        </>
    )
}

