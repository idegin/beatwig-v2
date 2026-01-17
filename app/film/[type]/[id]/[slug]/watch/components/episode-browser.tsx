"use client"

import * as React from "react"
import { Loader2, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Episode, Season } from "@/types/tmdb.types"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface EpisodeBrowserProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  seasons: Season[]
  episodes: Episode[]
  currentSeason: number
  currentEpisode: number
  loadingEpisodes: boolean
  onSeasonChange: (season: number) => void
  onEpisodeSelect: (season: number, episode: number) => void
  showId: number
}

export function EpisodeBrowser({
  open,
  onOpenChange,
  seasons,
  episodes,
  currentSeason,
  currentEpisode,
  loadingEpisodes,
  onSeasonChange,
  onEpisodeSelect,
}: EpisodeBrowserProps) {
  const [activeSeason, setActiveSeason] = React.useState(currentSeason)
  const [cachedEpisodes, setCachedEpisodes] = React.useState<Record<number, Episode[]>>({})
  const [loadingSeasonId, setLoadingSeasonId] = React.useState<number | null>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (episodes.length > 0) {
      setCachedEpisodes((prev) => ({
        ...prev,
        [currentSeason]: episodes,
      }))
    }
  }, [episodes, currentSeason])

  React.useEffect(() => {
    setActiveSeason(currentSeason)
  }, [currentSeason])

  React.useEffect(() => {
    if (!loadingEpisodes && loadingSeasonId !== null) {
      setLoadingSeasonId(null)
    }
  }, [loadingEpisodes, loadingSeasonId])

  const handleSeasonClick = (seasonNumber: number) => {
    setActiveSeason(seasonNumber)
    if (!cachedEpisodes[seasonNumber]) {
      setLoadingSeasonId(seasonNumber)
      onSeasonChange(seasonNumber)
    }
  }

  const getDisplayEpisodes = () => {
    return cachedEpisodes[activeSeason] || []
  }

  const isLoadingSeason = loadingSeasonId === activeSeason

  if (!open) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-40 animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />
      
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] md:w-[480px] bg-black/95 border-l border-white/10 z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Episodes</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 p-4 border-b border-white/10 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 size-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70"
            onClick={() => {
              const container = document.getElementById('season-scroll')
              if (container) container.scrollBy({ left: -100, behavior: 'smooth' })
            }}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div 
            id="season-scroll"
            className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {seasons.map((season) => (
              <button
                key={season.season_number}
                onClick={() => handleSeasonClick(season.season_number)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeSeason === season.season_number
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                )}
              >
                S{season.season_number}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 size-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70"
            onClick={() => {
              const container = document.getElementById('season-scroll')
              if (container) container.scrollBy({ left: 100, behavior: 'smooth' })
            }}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2"
        >
          {isLoadingSeason ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-white/50" />
            </div>
          ) : getDisplayEpisodes().length === 0 ? (
            <div className="flex items-center justify-center py-16 text-white/50">
              No episodes available
            </div>
          ) : (
            getDisplayEpisodes().map((episode) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                isActive={activeSeason === currentSeason && episode.episode_number === currentEpisode}
                onClick={() => onEpisodeSelect(activeSeason, episode.episode_number)}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}

interface EpisodeCardProps {
  episode: Episode
  isActive: boolean
  onClick: () => void
}

function EpisodeCard({ episode, isActive, onClick }: EpisodeCardProps) {
  const imageUrl = episode.still_path
    ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
    : null

  const watchProgress = episode.watchProgress || 0

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex gap-3 p-3 rounded-xl text-left transition-all duration-200",
        "hover:bg-white/10",
        isActive && "bg-white/15 ring-2 ring-primary"
      )}
    >
      <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-white/5 shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={episode.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
            No Image
          </div>
        )}
        {watchProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={watchProgress} className="h-1 rounded-none bg-white/20" />
          </div>
        )}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-xs font-semibold text-white">Playing</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-white/50 text-xs mb-1">Episode {episode.episode_number}</p>
        <p className="text-white font-medium text-sm line-clamp-1">{episode.name}</p>
        <p className="text-white/50 text-xs mt-1.5 line-clamp-2 leading-relaxed">{episode.overview || "No description available"}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
          {episode.runtime && <span>{episode.runtime} min</span>}
          {episode.vote_average > 0 && (
            <>
              <span>•</span>
              <span>★ {episode.vote_average.toFixed(1)}</span>
            </>
          )}
        </div>
      </div>
    </button>
  )
}
