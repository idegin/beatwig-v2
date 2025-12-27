"use client"

import Link from "next/link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import { ContinueWatchingCard } from "@/components/cards/continue-watching-card"
import { ContinueWatchingItem } from "@/types/firebase.types"

interface ContinueWatchingProps {
  items: ContinueWatchingItem[]
}

export function ContinueWatching({ items }: ContinueWatchingProps) {
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
        {items.map((item) => (
          <CarouselItem
            key={item.id}
            className="pl-3 md:pl-4 basis-auto"
          >
            <Link href={`/${item.type === "movie" ? "movies" : "tv"}/${item.id}`}>
              <ContinueWatchingCard item={item} />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
      <CarouselNext className="-right-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
    </Carousel>
  )
}
