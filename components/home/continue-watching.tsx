"use client"

import Link from "next/link"
import { Film } from "lucide-react"
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

function getWatchUrl(item: ContinueWatchingItem): string {
  const slug = slugify(item.title)
  const baseUrl = `/film/${item.type}/${item.id}/${slug}/watch`
  if (item.type === "tv" && item.season && item.episode) {
    return `${baseUrl}?season=${item.season}&episode=${item.episode}`
  }
  return baseUrl
}

export function ContinueWatching({ items }: ContinueWatchingProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Film className="size-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No watch history yet</p>
        <p className="text-sm text-muted-foreground/70">Start watching something to see it here</p>
      </div>
    )
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
        {items.map((item) => (
          <CarouselItem
            key={`${item.type}-${item.id}`}
            className="pl-3 md:pl-4 basis-auto"
          >
            <Link href={getWatchUrl(item)}>
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
