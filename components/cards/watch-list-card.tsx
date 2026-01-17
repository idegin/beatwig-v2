"use client"

import Link from "next/link"
import { X, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface WatchListItem {
  id: string
  title: string
  type: "movie" | "tv"
  image: string
  year: number
  rating: string
  watchlistCount: number
}

interface WatchListCardProps {
  item: WatchListItem
  onRemove?: (id: string) => void
}

export function WatchListCard({ item, onRemove }: WatchListCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsRemoving(true)
    setTimeout(() => {
      onRemove?.(item.id)
    }, 300)
  }

  const href = `/film/${item.type}/${item.id}/${item.title.toLowerCase().replace(/\s+/g, "-")}`

  return (
    <Link
      href={href}
      className={`group block transition-all duration-300 ${
        isRemoving ? "opacity-0 scale-95" : ""
      }`}
    >
      <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-lg z-10">
          <Bookmark className="size-3.5 fill-current text-primary-foreground" />
          <span className="text-xs font-bold text-primary-foreground">
            {item.watchlistCount >= 1000
              ? `${(item.watchlistCount / 1000).toFixed(1)}k`
              : item.watchlistCount.toLocaleString()}
          </span>
        </div>

        <div className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-50">
          <Button
            size="icon"
            variant="destructive"
            className="size-9 rounded-full shadow-lg hover:scale-110 transition-transform"
            onClick={handleRemove}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-0 md:translate-y-full opacity-100 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-md bg-white/20 backdrop-blur-sm px-2 py-0.5 text-xs font-semibold text-white">
              {item.type === "movie" ? "Movie" : "TV Show"}
            </span>
          </div>
          <h3 className="font-bold text-white text-base line-clamp-2 drop-shadow-lg mb-2">
            {item.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-white/90">
            <span>{item.year}</span>
            <span className="flex items-center gap-1">
              ⭐ {item.rating}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
