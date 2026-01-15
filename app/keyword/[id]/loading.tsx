import { Skeleton } from "@/components/ui/skeleton"

export default function KeywordDetailsLoading() {
    return (
        <div className="min-h-screen">
            <div className="relative w-full overflow-hidden">
                <Skeleton className="absolute inset-0 h-[450px]" />
                <div className="relative container mx-auto px-4 py-20 md:py-28">
                    <Skeleton className="h-8 w-32 mb-4" />
                    <Skeleton className="h-14 w-80 mb-4" />
                    <Skeleton className="h-6 w-96 mb-2" />
                    <Skeleton className="h-5 w-64" />
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {Array.from({ length: 18 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
