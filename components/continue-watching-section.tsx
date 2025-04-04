// components/continue-watching-section.tsx
import {ChevronRight} from "lucide-react"
import Link from "next/link"
import ContinueWatchingCard from "@/components/continue-watching-card"
import type {Movie, TVShow} from "@/lib/tmdb"

interface WatchProgress {
    media: Movie | TVShow
    progress: number
    episodeInfo?: {
        season: number
        episode: number
        name: string
    }
}

interface ContinueWatchingSectionProps {
    title: string
    viewAllHref?: string
    items: WatchProgress[]
}

export default function ContinueWatchingSection(
    {
        title,
        viewAllHref,
        items
    }: ContinueWatchingSectionProps) {
    if (!items || items.length === 0) return null

    return (
        <section className="py-8 continue-watching-section flex justify-center">
            <div className="container">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    {viewAllHref && (
                        <Link
                            href={viewAllHref}
                            className="flex items-center text-sm font-medium text-primary hover:underline"
                        >
                            View all
                            <ChevronRight className="h-4 w-4 ml-1"/>
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item, index) => (
                        <ContinueWatchingCard
                            key={item.media.id}
                            media={item.media}
                            progress={item.progress}
                            episodeInfo={item.episodeInfo}
                            priority={index < 4}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}