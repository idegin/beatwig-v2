"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import { NetworkCard } from "@/components/cards/network-card"
import { Network } from "@/types/tmdb.types"

interface NetworkRowProps {
  networks: Network[]
}

export function NetworkRow({ networks }: NetworkRowProps) {
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
        {networks.map((network) => (
          <CarouselItem
            key={network.id}
            className="pl-3 md:pl-4 basis-[45%] sm:basis-[35%] md:basis-[25%] lg:basis-[18%] xl:basis-[15%]"
          >
            <NetworkCard network={network} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
      <CarouselNext className="-right-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
    </Carousel>
  )
}
