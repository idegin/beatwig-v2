"use client"
// components/continue-watching-section.tsx
import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import ContinueWatchingCard from "@/components/continue-watching-card"
import { getUserWatchHistory } from "@/lib/firebase"
import { WATCH_HISTORY } from "@/lib/constants"
import type { Movie, TVShow } from "@/lib/tmdb"

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
    limit?: number
}

export default function ContinueWatchingSection(
    {
        title,
        viewAllHref,
        limit = WATCH_HISTORY.HOME_DISPLAY_LIMIT
    }: ContinueWatchingSectionProps) {
    const [items, setItems] = useState<WatchProgress[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchWatchHistory() {
            setLoading(true)
            try {
                const watchHistoryItems = await getUserWatchHistory(limit)
                
                // Process watch history into the format needed for display
                const watchHistory = watchHistoryItems.map(item => ({
                    media: {
                        id: item.mediaId,
                        title: item.title,
                        name: item.title,
                        poster_path: item.poster_path || null,
                        backdrop_path: item.backdrop_path || null,
                        vote_average: 0,
                        vote_count: 0,
                        overview: "",
                        popularity: 0,
                        genre_ids: [],
                        media_type: item.mediaType
                    },
                    progress: item.progress,
                    episodeInfo: item.seasonNumber ? {
                        season: item.seasonNumber,
                        episode: item.episodeNumber || 1,
                        name: item.episodeName || `Episode ${item.episodeNumber}`
                    } : undefined
                }));
                
                setItems(watchHistory)
            } catch (error) {
                console.error("Error fetching watch history:", error)
                setItems([])
            } finally {
                setLoading(false)
            }
        }
        
        fetchWatchHistory()
    }, [limit])

    if (loading) return null // Don't render anything while loading
    if (!items || items.length === 0) return null // Don't render if no watch history

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
                            //@ts-ignore
                            key={item.media.createdAt}
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
