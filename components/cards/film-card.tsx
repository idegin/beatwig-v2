"use client"

import Link from "next/link"
import { Play, Star } from "lucide-react"
import { Film } from "@/types/tmdb.types"
import { Button } from "@/components/ui/button"
import { TMDB_IMAGE_BASE } from "@/app/constants"

interface FilmCardProps {
    film: Film
    variant?: "default" | "wide" | "compact"
}

export function FilmCard({ film, variant = "default" }: FilmCardProps) {
    const isMovie = film.media_type === "movie" || film.title !== undefined
    const title = isMovie ? film.title : film.name
    const releaseDate = isMovie ? film.release_date : film.first_air_date
    const year = releaseDate ? new Date(releaseDate).getFullYear() : ""
    const href = `/${isMovie ? "movies" : "tv"}/${film.id}`
    const posterUrl = film.poster_path
        ? `${TMDB_IMAGE_BASE}/w500${film.poster_path}`
        : "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80"
    const backdropUrl = film.backdrop_path
        ? `${TMDB_IMAGE_BASE}/w780${film.backdrop_path}`
        : posterUrl

    if (variant === "wide") {
        return (
            <Link href={href} className="group block">
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

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-white text-lg line-clamp-1 drop-shadow-lg mb-1">
                            {title}
                        </h3>
                        <p className="text-sm text-white/70 line-clamp-2 mb-2">{film.overview}</p>
                        <div className="flex items-center gap-2 text-xs text-white/60">
                            {year && <span>{year}</span>}
                        </div>
                    </div>
                </div>
            </Link>
        )
    }

    if (variant === "compact") {
        return (
            <Link href={href} className="group block">
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

                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="font-semibold text-white text-sm line-clamp-2 drop-shadow-lg">
                            {title}
                        </h3>
                    </div>
                </div>
            </Link>
        )
    }

    return (
        <Link href={href} className="group block">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl">
                <img
                    src={posterUrl}
                    alt={title || "Film"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                <div className="absolute top-3 left-3">
                    <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
                        {isMovie ? "Movie" : "TV Show"}
                    </span>
                </div>

                <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 rounded-md bg-yellow-500/90 px-2 py-1 text-xs font-bold text-black backdrop-blur-sm">
                        <Star className="size-3 fill-current" />
                        {film.vote_average.toFixed(1)}
                    </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-40">
                    <div className="flex items-center gap-2">
                        <div className="size-14 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/50 transform scale-75 group-hover:scale-100 transition-transform">
                            <Play className="size-6 text-primary-foreground fill-current ml-0.5" />
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-white text-base line-clamp-2 drop-shadow-lg mb-1 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                        {year && <span>{year}</span>}
                    </div>
                </div>
            </div>
        </Link>
    )
}
