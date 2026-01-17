"use client"

import { Film } from "@/types/tmdb.types"
import { FilmCard } from "@/components/cards/film-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Film as FilmIcon } from "lucide-react"

interface KeywordGridProps {
  films: Film[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  observerRef: React.RefObject<HTMLDivElement | null>
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

export function KeywordGrid({ 
  films, 
  loading, 
  loadingMore, 
  hasMore, 
  observerRef 
}: KeywordGridProps) {
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <FilmCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (films.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FilmIcon className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No movies found</h2>
          <p className="text-muted-foreground">
            There are no movies available for this keyword.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
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
    </div>
  )
}
