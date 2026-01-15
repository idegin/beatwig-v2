"use client"

import * as React from "react"
import { Play, Plus, Volume2, VolumeX, Video, VideoOff, Star, Download, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppSettings } from "@/context/app-settings-context"

interface FilmHeroProps {
  title: string
  overview: string
  backdropPath: string
  posterPath: string
  releaseDate: string
  voteAverage: number
  genres: string[]
  runtime?: number
  certification?: string
  videoKey?: string
  mediaType: "movie" | "tv"
  tagline?: string
  onPlayTrailer: () => void
  onAddToWatchlist: () => void
  onDownload: () => void
  isInWatchlist?: boolean
  isWatchlistLoading?: boolean
}

export function FilmHero({
  title,
  overview,
  backdropPath,
  posterPath,
  releaseDate,
  voteAverage,
  genres,
  runtime,
  certification,
  videoKey,
  mediaType,
  tagline,
  onPlayTrailer,
  onAddToWatchlist,
  onDownload,
  isInWatchlist = false,
  isWatchlistLoading = false,
}: FilmHeroProps) {
  const { settings, updateSettings } = useAppSettings()

  const videoUrl = videoKey
    ? `https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=${settings.autoMuted ? 1 : 0}&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=${videoKey}`
    : null

  const toggleMute = () => {
    updateSettings({ autoMuted: !settings.autoMuted })
  }

  const toggleAutoPlay = () => {
    updateSettings({ autoPlayTrailer: !settings.autoPlayTrailer })
  }

  const formatRuntime = (minutes?: number) => {
    if (!minutes) return ""
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const year = releaseDate ? new Date(releaseDate).getFullYear() : ""

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        {settings.autoPlayTrailer && videoUrl ? (
          <iframe
            src={videoUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full object-cover scale-150"
            style={{ pointerEvents: "none" }}
          />
        ) : (
          <img
            src={backdropPath}
            alt={title}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-[90vh] flex-col justify-end pb-16 md:pb-24 pt-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-end lg:items-end">
            <div className="hidden lg:block shrink-0">
              <img
                src={posterPath}
                alt={title}
                className="w-64 xl:w-72 rounded-xl shadow-2xl shadow-black/50 border border-white/10"
              />
            </div>

            <div className="flex-1 space-y-5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground uppercase tracking-wide">
                  {mediaType === "movie" ? "Movie" : "TV Series"}
                </span>
                {certification && (
                  <span className="rounded-md bg-foreground/20 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-foreground border border-foreground/30">
                    {certification}
                  </span>
                )}
                <div className="flex items-center gap-1.5 rounded-md bg-yellow-500/20 backdrop-blur-sm px-3 py-1.5">
                  <Star className="size-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-yellow-500">{voteAverage.toFixed(1)}</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground drop-shadow-lg md:text-5xl lg:text-6xl xl:text-7xl">
                {title}
              </h1>

              {tagline && (
                <p className="text-lg italic text-muted-foreground/80 md:text-xl">
                  "{tagline}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {year && <span className="font-medium">{year}</span>}
                {genres.length > 0 && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span>{genres.join(", ")}</span>
                  </>
                )}
                {runtime && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span>{formatRuntime(runtime)}</span>
                  </>
                )}
              </div>

              <p className="text-base leading-relaxed text-muted-foreground md:text-lg line-clamp-3">
                {overview}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Button
                  size="lg"
                  onClick={onPlayTrailer}
                  className="h-14 gap-3 rounded-full bg-primary px-10 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40"
                >
                  <Play className="size-6 fill-current" />
                  Play Trailer
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={onAddToWatchlist}
                  className="h-14 gap-3 rounded-full border-2 border-foreground/20 bg-foreground/10 px-8 text-base font-semibold text-foreground backdrop-blur-sm transition-all hover:scale-105 hover:border-foreground/40 hover:bg-foreground/20 cursor-pointer"
                  disabled={isWatchlistLoading}
                >
                  {isInWatchlist ? (
                    <Check className="size-5 pointer-events-none" />
                  ) : (
                    <Plus className="size-5 pointer-events-none" />
                  )}
                  <span className="pointer-events-none">{isInWatchlist ? "In Watchlist" : "Watchlist"}</span>
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  onClick={onDownload}
                  className="h-14 gap-3 rounded-full px-8 text-base font-medium text-foreground/80 transition-all hover:bg-foreground/10 hover:text-foreground"
                >
                  <Download className="size-5" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-16 right-4 z-20 flex items-center gap-3 md:bottom-24 md:right-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleAutoPlay}
          className="size-11 rounded-full border border-foreground/30 bg-background/20 backdrop-blur-sm transition-all hover:bg-background/40"
          title={settings.autoPlayTrailer ? "Disable auto-play" : "Enable auto-play"}
        >
          {settings.autoPlayTrailer ? (
            <Video className="size-5 text-foreground" />
          ) : (
            <VideoOff className="size-5 text-foreground" />
          )}
        </Button>
        {settings.autoPlayTrailer && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="size-11 rounded-full border border-foreground/30 bg-background/20 backdrop-blur-sm transition-all hover:bg-background/40"
            title={settings.autoMuted ? "Unmute" : "Mute"}
          >
            {settings.autoMuted ? (
              <VolumeX className="size-5 text-foreground" />
            ) : (
              <Volume2 className="size-5 text-foreground" />
            )}
          </Button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
