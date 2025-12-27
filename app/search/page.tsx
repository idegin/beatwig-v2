"use client"

import { useState, useEffect, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, Film, Tv, User, Star, Play, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TMDB_IMAGE_BASE } from "@/app/constants"

interface SearchResult {
  id: number
  media_type: "movie" | "tv" | "person"
  title?: string
  name?: string
  poster_path?: string
  profile_path?: string
  backdrop_path?: string
  overview?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  known_for_department?: string
  known_for?: { title?: string; name?: string }[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

function SearchResultSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-card/50 border border-border/50 animate-pulse">
      <Skeleton className="w-24 h-36 md:w-32 md:h-48 rounded-lg shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const isMovie = result.media_type === "movie"
  const isTv = result.media_type === "tv"
  const isPerson = result.media_type === "person"

  const title = result.title || result.name || ""
  const slug = slugify(title)
  const date = isMovie ? result.release_date : result.first_air_date
  const year = date ? new Date(date).getFullYear() : null

  let href = ""
  let imageUrl = ""

  if (isPerson) {
    href = `/person/${result.id}`
    imageUrl = result.profile_path
      ? `${TMDB_IMAGE_BASE}/w300${result.profile_path}`
      : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=450&fit=crop"
  } else {
    href = `/film/${result.media_type}/${result.id}/${slug}`
    imageUrl = result.poster_path
      ? `${TMDB_IMAGE_BASE}/w300${result.poster_path}`
      : "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop"
  }

  return (
    <Link
      href={href}
      className="group flex gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card transition-all duration-300"
    >
      <div className="relative w-24 h-36 md:w-32 md:h-48 rounded-lg overflow-hidden shrink-0 bg-muted">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!isPerson && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-all">
            <div className="size-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all">
              <Play className="size-4 text-primary-foreground fill-current ml-0.5" />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <span
            className={`shrink-0 px-2 py-1 rounded-md text-xs font-medium ${
              isPerson
                ? "bg-purple-500/20 text-purple-400"
                : isMovie
                ? "bg-blue-500/20 text-blue-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {isPerson ? (
              <User className="size-3 inline mr-1" />
            ) : isMovie ? (
              <Film className="size-3 inline mr-1" />
            ) : (
              <Tv className="size-3 inline mr-1" />
            )}
            {isPerson ? "Person" : isMovie ? "Movie" : "TV"}
          </span>
        </div>

        {isPerson ? (
          <div className="space-y-2">
            {result.known_for_department && (
              <p className="text-sm text-muted-foreground">
                Known for: {result.known_for_department}
              </p>
            )}
            {result.known_for && result.known_for.length > 0 && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {result.known_for
                  .slice(0, 3)
                  .map((item) => item.title || item.name)
                  .join(", ")}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {year && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {year}
                </span>
              )}
              {result.vote_average !== undefined && result.vote_average > 0 && (
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star className="size-3.5 fill-current" />
                  {result.vote_average.toFixed(1)}
                </span>
              )}
            </div>
            {result.overview && (
              <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
                {result.overview}
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get("keyword") || ""
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState<"all" | "movie" | "tv" | "person">("all")
  const observerRef = useRef<HTMLDivElement>(null)

  const fetchResults = useCallback(
    async (pageNum: number, isNewSearch: boolean = false) => {
      if (!keyword) return

      if (isNewSearch) {
        setInitialLoading(true)
      } else {
        setLoading(true)
      }

      try {
        const res = await fetch(
          `/api/public/search?query=${encodeURIComponent(keyword)}&page=${pageNum}`
        )
        const data = await res.json()

        if (data.results) {
          if (isNewSearch) {
            setResults(data.results)
          } else {
            setResults((prev) => [...prev, ...data.results])
          }
          setHasMore(pageNum < data.total_pages)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
        setInitialLoading(false)
      }
    },
    [keyword]
  )

  useEffect(() => {
    setPage(1)
    setResults([])
    setHasMore(true)
    if (keyword) {
      fetchResults(1, true)
    } else {
      setInitialLoading(false)
    }
  }, [keyword, fetchResults])

  useEffect(() => {
    if (!hasMore || loading || initialLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchResults(nextPage)
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, initialLoading, page, fetchResults])

  const filteredResults = results.filter((result) => {
    if (filter === "all") return true
    return result.media_type === filter
  })

  const movieCount = results.filter((r) => r.media_type === "movie").length
  const tvCount = results.filter((r) => r.media_type === "tv").length
  const personCount = results.filter((r) => r.media_type === "person").length

  if (!keyword) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Search className="size-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Search for Movies, TV Shows & People
            </h1>
            <p className="text-muted-foreground max-w-md">
              Use the search bar above to find your favorite movies, TV shows,
              and actors.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Search results for &quot;{keyword}&quot;
          </h1>
          {!initialLoading && (
            <p className="text-muted-foreground">
              Found {results.length} results
            </p>
          )}
        </div>

        {!initialLoading && results.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({results.length})
            </Button>
            <Button
              variant={filter === "movie" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("movie")}
              className="gap-1"
            >
              <Film className="size-4" />
              Movies ({movieCount})
            </Button>
            <Button
              variant={filter === "tv" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("tv")}
              className="gap-1"
            >
              <Tv className="size-4" />
              TV Shows ({tvCount})
            </Button>
            <Button
              variant={filter === "person" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("person")}
              className="gap-1"
            >
              <User className="size-4" />
              People ({personCount})
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {initialLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <SearchResultSkeleton key={i} />
            ))
          ) : filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="size-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-muted-foreground">
                Try searching with different keywords
              </p>
            </div>
          ) : (
            <>
              {filteredResults.map((result) => (
                <SearchResultCard key={`${result.media_type}-${result.id}`} result={result} />
              ))}

              <div ref={observerRef} className="py-4">
                {loading && (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SearchResultSkeleton key={i} />
                    ))}
                  </div>
                )}
              </div>

              {!hasMore && results.length > 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No more results to load
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SearchResultSkeleton key={i} />
          ))}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
