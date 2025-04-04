"use client"

import Image from "next/image"
import Link from "next/link"
import { getTMDBImageUrl, formatRating, extractYear, isMovie, getMediaTitle, getMediaDate } from "@/lib/utils"
import { POSTER_SIZES } from "@/lib/constants"
import type { Movie, TVShow } from "@/lib/tmdb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WatchlistItem } from "@/lib/firebase"

interface WatchlistCardProps {
    media: WatchlistItem
    onRemove: () => void
    className?: string
}

export function WatchlistCard({ media, onRemove, className }: WatchlistCardProps) {
    if (!media) return null

    //@ts-ignore
    const title = media.title || media.name || ""
    //@ts-ignore
    const releaseDate = media.release_date || media.first_air_date
    const type = media.media_type
    const linkPath = `/${type}/${media.id}`

    // Get count of users who added this to their watchlist
    const usersCount = media.users_ids?.length || 0

    // Use placeholder if no poster is available
    const posterUrl = media.poster_path
        ? getTMDBImageUrl(media.poster_path, POSTER_SIZES.MEDIUM)
        : "/placeholder.svg?height=450&width=300"

    return (
        <div className={cn("group relative", className)}>
            <Link href={linkPath} className="block">
                <div className="aspect-[2/3] w-full relative rounded-lg overflow-hidden">
                    <Image
                        src={posterUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-lg font-bold text-white line-clamp-1">{title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {media.vote_average > 0 && (
                                    <Badge variant="outline" className="bg-black/50 text-white border-none">
                                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                        {formatRating(media.vote_average)}
                                    </Badge>
                                )}
                                {releaseDate && <span className="text-xs text-white/80">{extractYear(releaseDate)}</span>}
                                <Badge variant="outline" className="bg-primary/70 text-white border-none text-[10px] py-0 h-5">
                                    {type === "movie" ? "Movie" : "TV"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Users count badge */}
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-full flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {usersCount}
            </div>

            {/* Remove button */}
            <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onRemove()
                }}
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove from watchlist</span>
            </Button>
        </div>
    )
}
