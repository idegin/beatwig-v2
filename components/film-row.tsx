"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import { FilmCard } from "@/components/cards/film-card"
import { Film } from "@/types/tmdb.types"

interface FilmRowProps {
  films: Film[]
  variant?: "default" | "wide" | "compact"
}

export function FilmRow({ films, variant = "default" }: FilmRowProps) {
  const getBasis = () => {
    switch (variant) {
      case "wide":
        return "basis-[85%] sm:basis-[60%] md:basis-[45%] lg:basis-[35%] xl:basis-[28%]"
      case "compact":
        return "basis-[35%] sm:basis-[28%] md:basis-[22%] lg:basis-[16%] xl:basis-[13%]"
      default:
        return "basis-[45%] sm:basis-[35%] md:basis-[28%] lg:basis-[20%] xl:basis-[16%]"
    }
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-3 md:-ml-4">
        {films.map((film) => (
          <CarouselItem
            key={film.id}
            className={`pl-3 md:pl-4 ${getBasis()}`}
          >
            <FilmCard film={film} variant={variant} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
      <CarouselNext className="-right-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
    </Carousel>
  )
}
