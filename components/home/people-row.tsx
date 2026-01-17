"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import { PersonCard } from "@/components/cards/person-card"
import { Person } from "@/types/tmdb.types"

interface PeopleRowProps {
  people: Person[]
  variant?: "default" | "compact"
}

export function PeopleRow({ people, variant = "default" }: PeopleRowProps) {
  const getBasis = () => {
    switch (variant) {
      case "compact":
        return "basis-[25%] sm:basis-[20%] md:basis-[14%] lg:basis-[10%] xl:basis-[8%]"
      default:
        return "basis-[40%] sm:basis-[30%] md:basis-[22%] lg:basis-[16%] xl:basis-[12%]"
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
        {people.map((person) => (
          <CarouselItem
            key={person.id}
            className={`pl-3 md:pl-4 ${getBasis()}`}
          >
            <PersonCard person={person} size={variant} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
      <CarouselNext className="-right-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
    </Carousel>
  )
}
