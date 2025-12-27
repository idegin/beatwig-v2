"use client"

import * as React from "react"
import Link from "next/link"
import { Play, Clock, Calendar, Star } from "lucide-react"
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
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
  showTitle: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

function EpisodeCardSkeleton() {
  return (
    <div className="shrink-0 w-[220px] md:w-[260px]">
      <Skeleton className="aspect-video rounded-xl" />
      <div className="mt-3 px-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

function EpisodeCard({ 
  episode, 
  showId,
  showTitle,
  selectedSeason
}: { 
  episode: Episode
  showId: number
  showTitle: string
  selectedSeason: string
}) {
  const imageUrl = episode.still_path
    ? `https://image.tmdb.org/t/p/w400${episode.still_path}`
    : null

  const slug = slugify(showTitle)
  const watchUrl = `/film/tv/${showId}/${slug}/watch?season=${selectedSeason}&episode=${episode.episode_number}`

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link href={watchUrl} className="group block shrink-0 w-[220px] md:w-[260px]">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border-2 border-transparent hover:border-primary/50 transition-all duration-300">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={episode.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-muted/50">
                <Play className="size-8 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="size-14 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <Play className="size-6 text-primary-foreground fill-current ml-0.5" />
              </div>
            </div>
            <div className="absolute top-3 left-3 bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
              E{episode.episode_number}
            </div>
            {episode.vote_average > 0 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 text-yellow-400 text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
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
          <div className="mt-3 px-1">
            <h4 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {episode.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              {episode.runtime && <span>{episode.runtime} min</span>}
              {episode.watchProgress !== undefined && episode.watchProgress > 0 && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-primary font-medium">{episode.watchProgress}% watched</span>
                </>
              )}
            </div>
          </div>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="center" className="w-80 p-0 overflow-hidden">
        <div className="relative">
          {imageUrl && (
            <div className="relative aspect-video">
              <img
                src={imageUrl}
                alt={episode.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
            </div>
          )}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-primary">Episode {episode.episode_number}</span>
                <h4 className="text-sm font-bold text-foreground line-clamp-1">{episode.name}</h4>
              </div>
              {episode.vote_average > 0 && (
                <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
                  <Star className="size-3 fill-current" />
                  <span className="text-xs font-bold">{episode.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {episode.overview || "No description available for this episode."}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
              {episode.runtime && (
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>{episode.runtime} min</span>
                </div>
              )}
              {episode.air_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  <span>{formatDate(episode.air_date)}</span>
                </div>
              )}
            </div>
            <Button size="sm" className="w-full gap-2 mt-2" asChild>
              <Link href={watchUrl}>
                <Play className="size-4 fill-current" />
                Play Episode
              </Link>
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export function SeasonsEpisodes({ seasons, showId, showTitle }: SeasonsEpisodesProps) {
  const validSeasons = seasons.filter((s) => s.season_number > 0)
  const [selectedSeason, setSelectedSeason] = React.useState(
    validSeasons.length > 0 ? validSeasons[validSeasons.length - 1].season_number.toString() : "1"
  )
  const [episodes, setEpisodes] = React.useState<Episode[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchEpisodes() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/public/episodes?showId=${showId}&season=${selectedSeason}`)
        const data = await response.json()
        setEpisodes(data.episodes || [])
      } catch (error) {
        console.error("Failed to fetch episodes:", error)
        setEpisodes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEpisodes()
  }, [showId, selectedSeason])

  if (validSeasons.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-foreground">Seasons & Episodes</h3>
        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-full sm:w-[220px] bg-card/50 border-border/50">
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
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CarouselItem key={i} className="pl-3 md:pl-4 basis-auto">
                <EpisodeCardSkeleton />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : episodes.length > 0 ? (
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {episodes.map((episode) => (
              <CarouselItem key={episode.id} className="pl-3 md:pl-4 basis-auto">
                <EpisodeCard 
                  episode={episode}
                  showId={showId}
                  showTitle={showTitle}
                  selectedSeason={selectedSeason}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
          <CarouselNext className="-right-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
        </Carousel>
      ) : (
        <div className="text-center py-12 bg-card/30 rounded-xl border border-border/50">
          <p className="text-muted-foreground">No episodes available for this season</p>
        </div>
      )}
    </div>
  )
}
