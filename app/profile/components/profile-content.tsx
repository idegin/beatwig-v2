"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Film,
  Tv,
  Clock,
  Sparkles,
  Tag,
  Layers,
  LogOut,
  Settings,
  ChevronRight,
  Calendar,
  Star,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TMDB_IMAGE_BASE } from "@/app/constants"
import { useAuth } from "@/context/auth-context"

interface ProfileContentProps {
  user: {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
  }
  stats: {
    totalWatched: number
    moviesWatched: number
    tvShowsWatched: number
    algorithmItems: number
  }
  topAlgorithmItems: {
    id: number
    title: string
    mediaType: "movie" | "tv"
    posterPath: string
    backdropPath: string | null
    rank: number
    voteAverage: number
    genres: { id: number; name: string }[]
    releaseDate: string
  }[]
  topGenres: {
    id: number
    name: string
    rank: number
  }[]
  topTags: {
    name: string
    rank: number
  }[]
  algorithmUpdatedAt: Date | null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

function formatDate(date: Date | null): string {
  if (!date) return "Never"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function getRankColor(rank: number, maxRank: number): string {
  const percentage = rank / maxRank
  if (percentage > 0.8) return "bg-green-500/20 text-green-500 border-green-500/30"
  if (percentage > 0.5) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
  return "bg-blue-500/20 text-blue-500 border-blue-500/30"
}

export function ProfileContent({
  user,
  stats,
  topAlgorithmItems,
  topGenres,
  topTags,
  algorithmUpdatedAt,
}: ProfileContentProps) {
  const router = useRouter()
  const { signOut } = useAuth()

  const userInitials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  const maxGenreRank = Math.max(...topGenres.map((g) => g.rank), 1)
  const maxTagRank = Math.max(...topTags.map((t) => t.rank), 1)
  const maxItemRank = Math.max(...topAlgorithmItems.map((i) => i.rank), 1)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch {}
  }

  return (
    <div className="min-h-screen">
      <div className="relative w-full overflow-hidden bg-linear-to-b from-primary/10 via-primary/5 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="size-32 ring-4 ring-primary/20 shadow-xl">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold">{user.displayName || "User"}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                <span>Algorithm updated: {formatDate(algorithmUpdatedAt)}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 pt-4">
                <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
                  <Link href="/history">
                    <Clock className="size-4" />
                    Watch History
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
                  <Link href="/watchlist">
                    <Layers className="size-4" />
                    Watchlist
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full gap-2 text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-linear-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Clock className="size-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalWatched}</p>
                  <p className="text-sm text-muted-foreground">Total Watched</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-linear-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Film className="size-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.moviesWatched}</p>
                  <p className="text-sm text-muted-foreground">Movies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-linear-to-br from-green-500/10 to-transparent border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Tv className="size-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.tvShowsWatched}</p>
                  <p className="text-sm text-muted-foreground">TV Shows</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-linear-to-br from-orange-500/10 to-transparent border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Sparkles className="size-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.algorithmItems}</p>
                  <p className="text-sm text-muted-foreground">In Algorithm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {topAlgorithmItems.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="size-6 text-primary" />
                  Your Algorithm
                </h2>
                <p className="text-muted-foreground mt-1">
                  Content that influences your recommendations, ranked by importance
                </p>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {topAlgorithmItems.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/film/${item.mediaType}/${item.id}/${slugify(item.title)}`}
                  className="relative group shrink-0 w-40"
                >
                  <div className="absolute -top-2 -left-2 z-10 size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
                    #{index + 1}
                  </div>
                  <div className="relative aspect-2/3 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all group-hover:scale-[1.02]">
                    {item.posterPath ? (
                      <img
                        src={item.posterPath.startsWith("http") ? item.posterPath : `${TMDB_IMAGE_BASE}/w342${item.posterPath}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Film className="size-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-white text-sm font-medium line-clamp-2">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.mediaType === "movie" ? "Movie" : "TV"}
                        </Badge>
                        <span className="text-xs text-white/70 flex items-center gap-1">
                          <Star className="size-3 fill-yellow-500 text-yellow-500" />
                          {item.voteAverage.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 px-1">
                    <div className={`text-xs px-2 py-1 rounded-full border ${getRankColor(item.rank, maxItemRank)}`}>
                      Rank: {item.rank.toFixed(1)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {topGenres.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Layers className="size-6 text-primary" />
                Your Favorite Genres
              </h2>
              <p className="text-muted-foreground mt-1">
                Genres you watch the most, sorted by preference
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {topGenres.map((genre, index) => (
                <Link
                  key={genre.id}
                  href={`/genre/${genre.id}`}
                  className="group"
                >
                  <div
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all hover:scale-105 ${getRankColor(genre.rank, maxGenreRank)}`}
                  >
                    <span className="font-bold text-xs opacity-60">#{index + 1}</span>
                    <span className="font-medium">{genre.name}</span>
                    <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {topTags.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Tag className="size-6 text-primary" />
                Themes You Love
              </h2>
              <p className="text-muted-foreground mt-1">
                Keywords and themes from content you've watched
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {topTags.map((tag, index) => (
                <Link
                  key={tag.name}
                  href={`/keyword/${encodeURIComponent(tag.name)}`}
                  className="group"
                >
                  <Badge
                    variant="outline"
                    className={`px-3 py-1.5 text-sm capitalize transition-all hover:scale-105 ${getRankColor(tag.rank, maxTagRank)}`}
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {topAlgorithmItems.length === 0 && topGenres.length === 0 && topTags.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Sparkles className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your Algorithm is Empty</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start watching movies and TV shows to build your personalized recommendation algorithm.
              </p>
              <Button asChild>
                <Link href="/movies">Browse Movies</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
