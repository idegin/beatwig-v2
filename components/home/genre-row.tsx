"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import { GenreCard } from "@/components/cards/genre-card"
import { Genre } from "@/types/tmdb.types"

interface GenreRowProps {
  genres: Genre[]
  size?: "default" | "large"
}

export function GenreRow({ genres, size = "default" }: GenreRowProps) {
  const getBasis = () => {
    switch (size) {
      case "large":
        return "basis-[80%] sm:basis-[55%] md:basis-[40%] lg:basis-[30%] xl:basis-[25%]"
      default:
        return "basis-[45%] sm:basis-[35%] md:basis-[28%] lg:basis-[22%] xl:basis-[18%]"
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
        {genres.map((genre) => (
          <CarouselItem
            key={genre.id}
            className={`pl-3 md:pl-4 ${getBasis()}`}
          >
            <GenreCard genre={genre} size={size} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
      <CarouselNext className="-right-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
    </Carousel>
  )
}
