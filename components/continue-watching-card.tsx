// components/continue-watching-card.tsx
import Image from "next/image"
import Link from "next/link"
import {Progress} from "@/components/ui/progress"
import {getTMDBImageUrl, isMovie, getMediaTitle} from "@/lib/utils"
import {BACKDROP_SIZES} from "@/lib/constants"
import type {Movie, TVShow} from "@/lib/tmdb"
import {PlayCircle} from "lucide-react"

interface ContinueWatchingCardProps {
    media: Movie | TVShow
    progress: number
    episodeInfo?: {
        season: number
        episode: number
        name: string
    }
    priority?: boolean
}

export default function ContinueWatchingCard(
    {
        media,
        progress,
        episodeInfo,
        priority = false
    }: ContinueWatchingCardProps) {
    if (!media) return null

    const title = getMediaTitle(media)
    const linkPath = isMovie(media) ? `/movie/${media.id}` : `/tv/${media.id}`
    const backdropUrl = media.backdrop_path
        ? getTMDBImageUrl(media.backdrop_path, BACKDROP_SIZES.MEDIUM)
        : "/placeholder.svg?height=169&width=300"

    return (
        <Link href={linkPath} className="group relative block">
            <div className="aspect-video w-full relative rounded-lg overflow-hidden">
                <Image
                    src={backdropUrl}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={priority}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-base font-semibold text-white line-clamp-1">{title}</h3>
                        {episodeInfo && (
                            <p className="text-xs text-white/80 mt-1">
                                S{episodeInfo.season} E{episodeInfo.episode} - {episodeInfo.name}
                            </p>
                        )}
                    </div>
                </div>
                <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-12 h-12 text-white/90"/>
                </div>
            </div>
            <div className="mt-2">
                <Progress value={progress} className="h-1"/>
            </div>
        </Link>
    )
}