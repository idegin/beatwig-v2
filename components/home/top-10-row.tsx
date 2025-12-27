"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import { Top10Card } from "@/components/cards/top-10-card"
import { Film } from "@/types/tmdb.types"

interface Top10RowProps {
  films: Film[]
}

export function Top10Row({ films }: Top10RowProps) {
  const top10Films = films.slice(0, 10)

  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-1 md:-ml-2">
        {top10Films.map((film, index) => (
          <CarouselItem
            key={film.id}
            className="pl-1 md:pl-2 basis-[42%] sm:basis-[32%] md:basis-[25%] lg:basis-[20%] xl:basis-[16%]"
          >
            <Top10Card film={film} rank={index + 1} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
      <CarouselNext className="-right-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
    </Carousel>
  )
}
