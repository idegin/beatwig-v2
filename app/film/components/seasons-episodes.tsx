"use client"

import * as React from "react"
import { Play, Clock, Calendar, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Episode {
  id: number
  name: string
  overview: string
  episode_number: number
  season_number: number
  still_path: string | null
  air_date: string
  runtime: number | null
  vote_average: number
  watchProgress?: number
}

interface Season {
  id: number
  name: string
  overview: string
  season_number: number
  episode_count: number
  poster_path: string | null
  air_date: string
}

interface SeasonsEpisodesProps {
  seasons: Season[]
  showId: number
}

function EpisodeCardSkeleton() {
  return (
    <div className="shrink-0 w-[180px] md:w-[200px]">
      <Skeleton className="aspect-video rounded-lg" />
      <div className="mt-2 px-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

function EpisodeDetailsSkeleton() {
  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-border/50">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <Skeleton className="shrink-0 w-full md:w-[280px] aspect-video rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-48" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      </div>
    </div>
  )
}

function CompactEpisodeCard({ 
  episode, 
  isSelected,
  onClick 
}: { 
  episode: Episode
  isSelected: boolean
  onClick: () => void
}) {
  const imageUrl = episode.still_path
    ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
    : null

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative shrink-0 w-[180px] md:w-[200px] cursor-pointer transition-all",
        isSelected && "scale-[1.02]"
      )}
    >
      <div className={cn(
        "relative aspect-video rounded-lg overflow-hidden bg-muted border-2 transition-colors",
        isSelected ? "border-primary" : "border-transparent hover:border-primary/50"
      )}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={episode.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Play className="size-6 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="size-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Play className="size-4 text-primary-foreground fill-current ml-0.5" />
          </div>
        </div>
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded">
          E{episode.episode_number}
        </div>
        {episode.vote_average > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded">
            <Star className="size-3 fill-current" />
            {episode.vote_average.toFixed(1)}
          </div>
        )}
        {episode.watchProgress !== undefined && episode.watchProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={episode.watchProgress} className="h-1 rounded-none bg-white/20" />
          </div>
        )}
      </div>
      <div className="mt-2 px-1">
        <h4 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {episode.name}
        </h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          {episode.runtime && <span>{episode.runtime}m</span>}
          {episode.watchProgress !== undefined && episode.watchProgress > 0 && (
            <span className="text-primary">{episode.watchProgress}%</span>
          )}
        </div>
      </div>
    </div>
  )
}

function EpisodeDetails({ episode }: { episode: Episode }) {
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-border/50">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="relative shrink-0 w-full md:w-[280px] aspect-video rounded-lg overflow-hidden bg-muted">
          {episode.still_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w780${episode.still_path}`}
              alt={episode.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="size-10 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button size="lg" className="gap-2 shadow-lg">
              <Play className="size-5 fill-current" />
              Play Episode
            </Button>
          </div>
          {episode.watchProgress !== undefined && episode.watchProgress > 0 && (
            <div className="absolute bottom-0 left-0 right-0">
              <Progress value={episode.watchProgress} className="h-1.5 rounded-none" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-sm font-semibold text-primary">Episode {episode.episode_number}</span>
              <h3 className="text-xl font-bold text-foreground">{episode.name}</h3>
            </div>
            {episode.vote_average > 0 && (
              <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg">
                <Star className="size-4 fill-current" />
                <span className="font-bold">{episode.vote_average.toFixed(1)}</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
            {episode.overview || "No description available for this episode."}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {episode.runtime && (
              <div className="flex items-center gap-1.5">
                <Clock className="size-4" />
                <span>{episode.runtime} min</span>
              </div>
            )}
            {episode.air_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                <span>{formatDate(episode.air_date)}</span>
              </div>
            )}
            {episode.watchProgress !== undefined && episode.watchProgress > 0 && (
              <span className="text-primary font-medium">{episode.watchProgress}% watched</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SeasonsEpisodes({ seasons, showId }: SeasonsEpisodesProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const validSeasons = seasons.filter((s) => s.season_number > 0)
  const [selectedSeason, setSelectedSeason] = React.useState(
    validSeasons.length > 0 ? validSeasons[validSeasons.length - 1].season_number.toString() : "1"
  )
  const [episodes, setEpisodes] = React.useState<Episode[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedEpisode, setSelectedEpisode] = React.useState<Episode | null>(null)

  React.useEffect(() => {
    async function fetchEpisodes() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/public/episodes?showId=${showId}&season=${selectedSeason}`)
        const data = await response.json()
        const fetchedEpisodes = data.episodes || []
        setEpisodes(fetchedEpisodes)
        setSelectedEpisode(fetchedEpisodes.length > 0 ? fetchedEpisodes[0] : null)
      } catch (error) {
        console.error("Failed to fetch episodes:", error)
        setEpisodes([])
        setSelectedEpisode(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEpisodes()
  }, [showId, selectedSeason])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  if (validSeasons.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-foreground">Seasons & Episodes</h3>
        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-full sm:w-[200px] bg-card/50 border-border/50">
            <SelectValue placeholder="Select Season" />
          </SelectTrigger>
          <SelectContent>
            {validSeasons.map((season) => (
              <SelectItem key={season.id} value={season.season_number.toString()}>
                {season.name} ({season.episode_count} ep)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <>
          <div className="relative">
            <div 
              className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <EpisodeCardSkeleton key={i} />
              ))}
            </div>
          </div>
          <EpisodeDetailsSkeleton />
        </>
      ) : episodes.length > 0 ? (
        <>
          <div className="relative group/carousel">
            <div 
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {episodes.map((episode) => (
                <CompactEpisodeCard 
                  key={episode.id} 
                  episode={episode}
                  isSelected={selectedEpisode?.id === episode.id}
                  onClick={() => setSelectedEpisode(episode)}
                />
              ))}
            </div>
            {episodes.length > 4 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => scroll("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 size-10 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => scroll("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 size-10 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </>
            )}
          </div>

          {selectedEpisode && <EpisodeDetails episode={selectedEpisode} />}
        </>
      ) : (
        <div className="text-center py-12 bg-card/30 rounded-xl border border-border/50">
          <p className="text-muted-foreground">No episodes available for this season</p>
        </div>
      )}
    </div>
  )
}
