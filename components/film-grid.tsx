"use client"

import { useEffect, useState, useRef } from "react"
import { Film } from "@/types/tmdb.types"
import { FilmCard } from "@/components/cards/film-card"
import { Spinner } from "@/components/ui/spinner"

interface FilmGridProps {
  initialFilms: Film[]
  onLoadMore?: () => Promise<Film[]>
  hasMore?: boolean
  variant?: "default" | "wide" | "compact"
}

export function FilmGrid({
  initialFilms,
  onLoadMore,
  hasMore = false,
  variant = "default",
}: FilmGridProps) {
  const [films, setFilms] = useState<Film[]>(initialFilms)
  const [loading, setLoading] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!onLoadMore || !hasMore) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          handleLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loading, hasMore, onLoadMore])

  const handleLoadMore = async () => {
    if (!onLoadMore || loading) return

    setLoading(true)
    try {
      const newFilms = await onLoadMore()
      setFilms((prev) => [...prev, ...newFilms])
    } catch (error) {
      console.error("Error loading more films:", error)
    } finally {
      setLoading(false)
    }
  }

  const getGridClasses = () => {
    switch (variant) {
      case "wide":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      case "compact":
        return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4"
      default:
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
    }
  }

  return (
    <div className="space-y-8">
      <div className={getGridClasses()}>
        {films.map((film) => (
          <FilmCard key={film.id} film={film} variant={variant} />
        ))}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Spinner className="size-6" />
              <span className="text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
