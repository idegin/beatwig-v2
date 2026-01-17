"use client"

import { Film } from "@/types/tmdb.types"
import { FilmCard } from "@/components/cards/film-card"

interface FilmGridSectionProps {
  films: Film[]
  variant?: "default" | "wide" | "compact"
  maxItems?: number
}

export function FilmGridSection({ 
  films, 
  variant = "default",
  maxItems
}: FilmGridSectionProps) {
  const displayFilms = maxItems ? films.slice(0, maxItems) : films

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
    <div className={getGridClasses()}>
      {displayFilms.map((film) => (
        <FilmCard key={film.id} film={film} variant={variant} />
      ))}
    </div>
  )
}
