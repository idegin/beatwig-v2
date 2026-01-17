"use client"

import { useState } from "react"
import Link from "next/link"
import { Play, Star } from "lucide-react"
import { Film } from "@/types/tmdb.types"
import { analytics$ } from "@/lib/analytics"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { TMDB_IMAGE_BASE } from "@/app/constants"

interface FilmCardProps {
    film: Film
    variant?: "default" | "wide" | "compact"
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim()
}

export function FilmCard({ film, variant = "default" }: FilmCardProps) {
    const [open, setOpen] = useState(false)
    const isMovie = film.media_type === "movie" || film.title !== undefined
    const title = isMovie ? film.title : film.name
    const releaseDate = isMovie ? film.release_date : film.first_air_date
    const year = releaseDate ? new Date(releaseDate).getFullYear() : ""
    const slug = title ? slugify(title) : "untitled"
    const href = `/film/${isMovie ? "movie" : "tv"}/${film.id}/${slug}`

    const handleClick = () => {
        analytics$.selectContent({
            contentId: film.id,
            contentType: isMovie ? "movie" : "tv",
            title: title || "Unknown",
        })
    }
    const posterUrl = film.poster_path
        ? `${TMDB_IMAGE_BASE}/w500${film.poster_path}`
        : "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80"
    const backdropUrl = film.backdrop_path
        ? `${TMDB_IMAGE_BASE}/w780${film.backdrop_path}`
        : posterUrl

    if (variant === "wide") {
        return (
            <HoverCard open={open} onOpenChange={setOpen} openDelay={500} closeDelay={300}>
                <HoverCardTrigger asChild>
                    <Link href={href} onClick={handleClick} className="group block">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-2xl">
                            <img
                                src={backdropUrl}
                                alt={title || "Film"}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                            <div className="absolute top-3 left-3 flex items-center gap-2">
                                <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
                                    {isMovie ? "Movie" : "TV Show"}
                                </span>
                                <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground backdrop-blur-sm">
                                    <Star className="size-3 fill-current" />
                                    {film.vote_average.toFixed(1)}
                                </span>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-40">
                                <div className="size-16 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/50 transform scale-75 group-hover:scale-100 transition-transform">
                                    <Play className="size-7 text-primary-foreground fill-current ml-1" />
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                <h3 className="font-bold text-white text-lg line-clamp-1 drop-shadow-lg mb-1">
                                    {title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-white/90">
                                    {year && <span>{year}</span>}
                                </div>
                            </div>
                        </div>
                    </Link>
                </HoverCardTrigger>
                <HoverCardContent className="w-80" side="top" align="center">
                    <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm line-clamp-2">{title}</h4>
                            <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 flex-shrink-0">
                                <Star className="size-3 fill-current" />
                                {film.vote_average.toFixed(1)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {isMovie ? "Movie" : "TV Show"}
                            </span>
                            {year && <span>{year}</span>}
                        </div>
                        {film.overview && (
                            <p className="text-xs text-muted-foreground line-clamp-3">
                                {film.overview}
                            </p>
                        )}
                    </div>
                </HoverCardContent>
            </HoverCard>
        )
    }

    if (variant === "compact") {
        return (
            <HoverCard open={open} onOpenChange={setOpen} openDelay={500} closeDelay={300}>
                <HoverCardTrigger asChild>
                    <Link href={href} onClick={handleClick} className="group block">
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-xl">
                            <img
                                src={posterUrl}
                                alt={title || "Film"}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="flex items-center gap-1 rounded-md bg-yellow-500/90 px-1.5 py-0.5 text-xs font-bold text-black">
                                    <Star className="size-2.5 fill-current" />
                                    {film.vote_average.toFixed(1)}
                                </span>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-40">
                                <div className="size-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                                    <Play className="size-5 text-primary-foreground fill-current ml-0.5" />
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                <h3 className="font-semibold text-white text-sm line-clamp-2 drop-shadow-lg mb-1">
                                    {title}
                                </h3>
                                {year && (
                                    <p className="text-xs text-white/80">{year}</p>
                                )}
                            </div>
                        </div>
                    </Link>
                </HoverCardTrigger>
                <HoverCardContent className="w-80" side="top" align="center">
                    <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm line-clamp-2">{title}</h4>
                            <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 flex-shrink-0">
                                <Star className="size-3 fill-current" />
                                {film.vote_average.toFixed(1)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {isMovie ? "Movie" : "TV Show"}
                            </span>
                            {year && <span>{year}</span>}
                        </div>
                        {film.overview && (
                            <p className="text-xs text-muted-foreground line-clamp-3">
                                {film.overview}
                            </p>
                        )}
                    </div>
                </HoverCardContent>
            </HoverCard>
        )
    }

    return (
        <HoverCard open={open} onOpenChange={setOpen} openDelay={500} closeDelay={300}>
            <HoverCardTrigger asChild>
                <Link href={href} onClick={handleClick} className="group block">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl">
                        <img
                            src={posterUrl}
                            alt={title || "Film"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-40">
                            <div className="flex items-center gap-2">
                                <div className="size-14 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/50 transform scale-75 group-hover:scale-100 transition-transform">
                                    <Play className="size-6 text-primary-foreground fill-current ml-0.5" />
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <h3 className="font-bold text-white text-base line-clamp-2 drop-shadow-lg mb-1 transition-colors">
                                {title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-white/90">
                                {year && <span>{year}</span>}
                            </div>
                        </div>
                    </div>
                </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" side="top" align="center">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm line-clamp-2">{title}</h4>
                        <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 flex-shrink-0">
                            <Star className="size-3 fill-current" />
                            {film.vote_average.toFixed(1)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {isMovie ? "Movie" : "TV Show"}
                        </span>
                        {year && <span>{year}</span>}
                    </div>
                    {film.overview && (
                        <p className="text-xs text-muted-foreground line-clamp-3">
                            {film.overview}
                        </p>
                    )}
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}
