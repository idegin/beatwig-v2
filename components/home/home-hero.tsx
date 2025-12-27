"use client"

import * as React from "react"
import Link from "next/link"
import { Play, Plus, Volume2, VolumeX, Info, Video, VideoOff, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppSettings } from "@/context/app-settings-context"
import { HeroData } from "@/types/tmdb.types"
import { TMDB_IMAGE_BASE } from "@/app/constants"

interface HomeHeroProps {
  data: HeroData
}

export function HomeHero({ data }: HomeHeroProps) {
  const { settings, updateSettings } = useAppSettings()
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim()
  }

  const filmSlug = slugify(data.title)
  const filmUrl = `/film/${data.media_type}/${data.id}/${filmSlug}`

  const backdropUrl = data.backdrop_path
    ? `${TMDB_IMAGE_BASE}/original${data.backdrop_path}`
    : "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920&q=80"

  const videoUrl = data.video_key
    ? `https://www.youtube.com/embed/${data.video_key}?autoplay=1&mute=${settings.autoMuted ? 1 : 0}&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=${data.video_key}`
    : null

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = settings.autoMuted
    }
  }, [settings.autoMuted])

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
    return `${hours}h ${mins}m`
  }

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
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
            src={backdropUrl}
            alt={data.title}
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end pb-32 md:pb-40">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-primary-foreground" />
                NOW PLAYING
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {new Date(data.release_date).getFullYear()} • {data.genres.join(", ")} • {formatRuntime(data.runtime)}
              </span>
            </div>

            <Link href={filmUrl}>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground drop-shadow-lg md:text-5xl lg:text-6xl hover:text-primary transition-colors cursor-pointer">
                {data.title}
              </h1>
            </Link>

            <p className="text-base leading-relaxed text-muted-foreground md:text-lg line-clamp-3">
              {data.overview}
            </p>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Star className="size-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-foreground">{data.vote_average.toFixed(1)}</span>
                <span>/10</span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <span>#1 in {data.media_type === "movie" ? "Movies" : "TV Shows"} Today</span>
              <span className="text-muted-foreground/50">•</span>
              <span>4K Ultra HD</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                className="h-12 gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40"
              >
                <Play className="size-5 fill-current" />
                Watch Trailer
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 gap-2 rounded-full border-2 border-foreground/20 bg-foreground/10 px-8 text-base font-semibold text-foreground backdrop-blur-sm transition-all hover:scale-105 hover:border-foreground/40 hover:bg-foreground/20"
              >
                <Plus className="size-5" />
                Add to Watch List
              </Button>

              <Button
                size="lg"
                variant="ghost"
                asChild
                className="h-12 gap-2 rounded-full px-6 text-base font-medium text-foreground/80 transition-all hover:bg-foreground/10 hover:text-foreground"
              >
                <Link href={filmUrl}>
                  <Info className="size-5" />
                  More Info
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-32 right-4 z-20 flex items-center gap-3 md:bottom-40 md:right-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleAutoPlay}
          className="size-10 rounded-full border border-foreground/30 bg-background/20 backdrop-blur-sm transition-all hover:bg-background/40"
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
            className="size-10 rounded-full border border-foreground/30 bg-background/20 backdrop-blur-sm transition-all hover:bg-background/40"
            title={settings.autoMuted ? "Unmute" : "Mute"}
          >
            {settings.autoMuted ? (
              <VolumeX className="size-5 text-foreground" />
            ) : (
              <Volume2 className="size-5 text-foreground" />
            )}
          </Button>
        )}
        {data.certification && (
          <div className="flex items-center gap-2 rounded-md border-l-2 border-foreground/50 bg-background/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-sm font-medium text-foreground">{data.certification}</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 h-32 bg-linear-to-t from-background to-transparent" />
    </section>
  )
}
