"use client"

import { Film } from "@/types/tmdb.types"
import { TMDB_IMAGE_BASE } from "@/app/constants"
import { Hash, Film as FilmIcon, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Keyword {
  id: number
  name: string
}

interface KeywordHeroProps {
  keyword: Keyword | null
  totalResults: number
  heroFilm?: Film
  loading?: boolean
}

export function KeywordHero({ keyword, totalResults, heroFilm, loading }: KeywordHeroProps) {
  const backgroundImage = heroFilm?.backdrop_path
    ? `${TMDB_IMAGE_BASE}/original${heroFilm.backdrop_path}`
    : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80"

  const keywordName = keyword?.name || "Loading..."

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt={keywordName}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            loading ? "opacity-50" : "opacity-100"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 py-20 md:py-28 lg:py-32">
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-12 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30">
              <Hash className="size-6 text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Keyword
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white capitalize drop-shadow-2xl">
            {keywordName}
          </h1>

          <p className="text-lg md:text-xl text-white/80 drop-shadow-lg max-w-2xl">
            Discover movies related to &quot;{keywordName}&quot;
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <FilmIcon className="size-4 text-primary" />
              <span className="text-sm font-medium text-white">
                {totalResults.toLocaleString()} {totalResults === 1 ? "Movie" : "Movies"}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <TrendingUp className="size-4 text-green-400" />
              <span className="text-sm font-medium text-white">
                Sorted by Popularity
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  )
}
