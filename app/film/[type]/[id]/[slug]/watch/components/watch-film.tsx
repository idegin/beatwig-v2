"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, Layers, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { FilmDetailsData, Episode, Season } from "@/types/tmdb.types"
import { EpisodeBrowser } from "./episode-browser"
import { useWatchHistory } from "@/hooks/use-watch-history"

interface WatchFilmProps {
  data: FilmDetailsData
  mediaType: "movie" | "tv"
  filmId: number
  slug: string
  initialSeason?: number
  initialEpisode?: number
}

const SERVERS = [
  { id: "a", name: "Server A", domain: "vidsrc.win", type: "vidsrc-win" as const },
  { id: "b", name: "Server B", domain: "vidsrc-embed.su", type: "vidsrc-embed" as const },
  { id: "c", name: "Server C", domain: "vidsrcme.su", type: "vidsrc-embed" as const },
  { id: "d", name: "Server D", domain: "vsrc.su", type: "vidsrc-embed" as const },
]

const SELECTED_SERVER_KEY = "beatwig-selected-server"

function getStoredServer(): typeof SERVERS[0] {
  if (typeof window === "undefined") return SERVERS[0]
  
  try {
    const stored = localStorage.getItem(SELECTED_SERVER_KEY)
    if (stored) {
      const server = SERVERS.find((s) => s.id === stored)
      if (server) return server
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error)
  }
  return SERVERS[0]
}

function storeServer(serverId: string): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(SELECTED_SERVER_KEY, serverId)
  } catch (error) {
    console.error("Error writing to localStorage:", error)
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

export function WatchFilm({
  data,
  mediaType,
  filmId,
  slug,
  initialSeason = 1,
  initialEpisode = 1,
}: WatchFilmProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const [browserOpen, setBrowserOpen] = React.useState(false)
  const [selectedServer, setSelectedServer] = React.useState(getStoredServer)
  const [showControls, setShowControls] = React.useState(true)
  const [episodes, setEpisodes] = React.useState<Episode[]>([])
  const [loadingEpisodes, setLoadingEpisodes] = React.useState(false)
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleServerChange = (server: typeof SERVERS[0]) => {
    setSelectedServer(server)
    storeServer(server.id)
  }

  const currentSeason = parseInt(searchParams.get("season") || String(initialSeason))
  const currentEpisode = parseInt(searchParams.get("episode") || String(initialEpisode))

  const isTV = mediaType === "tv"
  const seasons = data.seasons?.filter((s) => s.season_number > 0) || []

  const currentEpisodeData = episodes.find((ep) => ep.episode_number === currentEpisode)

  const watchHistoryData = React.useMemo(
    () => {
      const tags = data.keywords?.map((k) => k.name) || []
      return {
        filmId,
        mediaType,
        title: data.title,
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
        voteAverage: data.vote_average,
        releaseDate: data.release_date || "",
        runtime: isTV ? (currentEpisodeData?.runtime ?? 45) : (data.runtime ?? null),
        originalLanguage: data.original_language,
        country: data.production_countries?.[0]?.iso_3166_1 || "",
        tags,
        genres: data.genreObjects || [],
        genreIds: data.genreObjects?.map((g) => g.id) || [],
        popularity: data.popularity || 0,
        ...(isTV && {
          season: currentSeason,
          episode: currentEpisode,
          episodeTitle: currentEpisodeData?.name,
        }),
      }
    },
    [filmId, mediaType, data, isTV, currentSeason, currentEpisode, currentEpisodeData]
  )

  useWatchHistory({
    filmData: watchHistoryData,
    iframeRef,
  })

  React.useEffect(() => {
    if (isTV && currentSeason) {
      fetchEpisodes(currentSeason)
    }
  }, [currentSeason, isTV])

  const fetchEpisodes = async (seasonNumber: number) => {
    setLoadingEpisodes(true)
    try {
      const response = await fetch(`/api/public/episodes?showId=${filmId}&season=${seasonNumber}`)
      const data = await response.json()
      setEpisodes(data.episodes || [])
    } catch (error) {
      console.error("Error fetching episodes:", error)
      setEpisodes([])
    } finally {
      setLoadingEpisodes(false)
    }
  }

  const getIframeUrl = () => {
    if (selectedServer.type === "vidsrc-win") {
      const params = new URLSearchParams({
        autoplay: "1",
        ds_lang: "en",
      })
      
      if (isTV) {
        params.set("id", String(filmId))
        params.set("s", String(currentSeason))
        params.set("e", String(currentEpisode))
        return `https://${selectedServer.domain}/tv.html?${params.toString()}`
      }
      params.set("id", String(filmId))
      return `https://${selectedServer.domain}/movie.html?${params.toString()}`
    }
    
    if (isTV) {
      return `https://${selectedServer.domain}/embed/tv/${filmId}/${currentSeason}-${currentEpisode}`
    }
    return `https://${selectedServer.domain}/embed/movie/${filmId}`
  }

  const nextEpisodeData = episodes.find((ep) => ep.episode_number === currentEpisode + 1)
  const prevEpisodeData = episodes.find((ep) => ep.episode_number === currentEpisode - 1)

  const navigateToEpisode = (season: number, episode: number) => {
    router.push(`/film/tv/${filmId}/${slug}/watch?season=${season}&episode=${episode}`)
    setBrowserOpen(false)
  }

  const goToNextEpisode = () => {
    if (nextEpisodeData) {
      navigateToEpisode(currentSeason, currentEpisode + 1)
    } else {
      const nextSeason = seasons.find((s) => s.season_number === currentSeason + 1)
      if (nextSeason) {
        navigateToEpisode(currentSeason + 1, 1)
      }
    }
  }

  const goToPrevEpisode = () => {
    if (prevEpisodeData) {
      navigateToEpisode(currentSeason, currentEpisode - 1)
    } else {
      const prevSeason = seasons.find((s) => s.season_number === currentSeason - 1)
      if (prevSeason) {
        navigateToEpisode(currentSeason - 1, prevSeason.episode_count)
      }
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  React.useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  const hasNextEpisode = isTV && (nextEpisodeData || seasons.some((s) => s.season_number === currentSeason + 1))
  const hasPrevEpisode = isTV && (prevEpisodeData || seasons.some((s) => s.season_number === currentSeason - 1))

  return (
    <div
      className="relative h-screen w-screen bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <iframe
        ref={iframeRef}
        src={getIframeUrl()}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      <div
        className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-linear-to-b from-black/90 via-black/60 to-transparent p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                <Link href={`/film/${mediaType}/${filmId}/${slug}`}>
                  <ArrowLeft className="size-5" />
                </Link>
              </Button>

              <div className="hidden sm:block">
                <h1 className="text-white font-semibold text-lg line-clamp-1">{data.title}</h1>
                {isTV && (
                  <p className="text-white/70 text-sm">
                    S{currentSeason} E{currentEpisode}
                    {currentEpisodeData && ` • ${currentEpisodeData.name}`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isTV && (
                <>
                  <HoverCard openDelay={100} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPrevEpisode}
                        disabled={!hasPrevEpisode}
                        className="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm disabled:opacity-30"
                      >
                        <ChevronLeft className="size-5" />
                      </Button>
                    </HoverCardTrigger>
                    {prevEpisodeData && (
                      <HoverCardContent side="bottom" className="w-72 p-0 overflow-hidden">
                        <EpisodeHoverCard episode={prevEpisodeData} label="Previous Episode" />
                      </HoverCardContent>
                    )}
                  </HoverCard>

                  <Button
                    variant="ghost"
                    onClick={() => setBrowserOpen(true)}
                    className="h-10 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm gap-2"
                  >
                    <Layers className="size-4" />
                    <span className="hidden sm:inline">Episodes</span>
                  </Button>

                  <HoverCard openDelay={100} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNextEpisode}
                        disabled={!hasNextEpisode}
                        className="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm disabled:opacity-30"
                      >
                        <ChevronRight className="size-5" />
                      </Button>
                    </HoverCardTrigger>
                    {nextEpisodeData && (
                      <HoverCardContent side="bottom" className="w-72 p-0 overflow-hidden">
                        <EpisodeHoverCard episode={nextEpisodeData} label="Next Episode" />
                      </HoverCardContent>
                    )}
                  </HoverCard>
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm gap-2"
                  >
                    <Server className="size-4" />
                    <span className="hidden sm:inline">{selectedServer.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {SERVERS.map((server) => (
                    <DropdownMenuItem
                      key={server.id}
                      onClick={() => handleServerChange(server)}
                      className={selectedServer.id === server.id ? "bg-primary/10 text-primary" : ""}
                    >
                      {server.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <EpisodeBrowser
        open={browserOpen}
        onOpenChange={setBrowserOpen}
        seasons={seasons}
        episodes={episodes}
        currentSeason={currentSeason}
        currentEpisode={currentEpisode}
        loadingEpisodes={loadingEpisodes}
        onSeasonChange={fetchEpisodes}
        onEpisodeSelect={navigateToEpisode}
        showId={filmId}
      />
    </div>
  )
}

function EpisodeHoverCard({ episode, label }: { episode: Episode; label: string }) {
  const imageUrl = episode.still_path
    ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
    : null

  return (
    <div>
      {imageUrl && (
        <div className="relative aspect-video">
          <img src={imageUrl} alt={episode.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        </div>
      )}
      <div className="p-3 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm">
          E{episode.episode_number}: {episode.name}
        </p>
        {episode.runtime && (
          <p className="text-xs text-muted-foreground">{episode.runtime} min</p>
        )}
      </div>
    </div>
  )
}
