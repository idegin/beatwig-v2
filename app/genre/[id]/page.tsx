"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { FilmCard } from "@/components/cards/film-card"
import { Film } from "@/types/tmdb.types"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Film as FilmIcon, Tv } from "lucide-react"

const genreNames: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
}

function FilmCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export default function GenreDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const genreId = parseInt(params.id as string)
  const mediaTypeParam = searchParams.get("type") || "movie"
  const [mediaType, setMediaType] = useState<"movie" | "tv">(mediaTypeParam as "movie" | "tv")
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<HTMLDivElement>(null)

  const genreName = genreNames[genreId] || "Unknown Genre"

  const fetchFilms = useCallback(async (pageNum: number, isNewFetch: boolean = false) => {
    if (isNewFetch) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const res = await fetch(
        `/api/public/genre?genreId=${genreId}&mediaType=${mediaType}&page=${pageNum}`
      )
      const data = await res.json()

      if (data.results) {
        if (isNewFetch) {
          setFilms(data.results)
        } else {
          setFilms((prev) => [...prev, ...data.results])
        }
        setHasMore(pageNum < data.total_pages)
      }
    } catch (error) {
      console.error("Error fetching genre films:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [genreId, mediaType])

  useEffect(() => {
    setPage(1)
    setFilms([])
    setHasMore(true)
    fetchFilms(1, true)
  }, [genreId, mediaType, fetchFilms])

  useEffect(() => {
    if (!hasMore || loadingMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchFilms(nextPage)
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, page, fetchFilms])

  const handleMediaTypeChange = (type: "movie" | "tv") => {
    setMediaType(type)
  }

  return (
    <div className="min-h-screen">
      <PageHero
        heading={genreName}
        subHeading={`Explore ${mediaType === "movie" ? "movies" : "TV shows"} in the ${genreName.toLowerCase()} genre`}
        backgroundImage="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80"
        gradient="dark"
      >
        <div className="flex gap-3 mt-6">
          <Button
            variant={mediaType === "movie" ? "default" : "outline"}
            onClick={() => handleMediaTypeChange("movie")}
            className="gap-2"
          >
            <FilmIcon className="size-4" />
            Movies
          </Button>
          <Button
            variant={mediaType === "tv" ? "default" : "outline"}
            onClick={() => handleMediaTypeChange("tv")}
            className="gap-2"
          >
            <Tv className="size-4" />
            TV Shows
          </Button>
        </div>
      </PageHero>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <FilmCardSkeleton key={i} />
            ))}
          </div>
        ) : films.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FilmIcon className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No content found</h2>
            <p className="text-muted-foreground">
              There are no {mediaType === "movie" ? "movies" : "TV shows"} available in this genre.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {films.map((film) => (
                <FilmCard key={film.id} film={film} />
              ))}
            </div>

            <div ref={observerRef} className="py-8">
              {loadingMore && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <FilmCardSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>

            {!hasMore && films.length > 0 && (
              <p className="text-center text-muted-foreground py-4">
                You&apos;ve reached the end
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}