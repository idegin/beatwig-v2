"use client"

import Link from "next/link"
import { Play, X, Users } from "lucide-react"
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
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
          <Button
            size="icon"
            variant="destructive"
            className="size-9 rounded-full shadow-lg hover:scale-110 transition-transform"
            onClick={handleRemove}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
            {item.type === "movie" ? "Movie" : "TV Show"}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-40">
          <div className="size-14 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/50 transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="size-6 text-primary-foreground fill-current ml-0.5" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="font-bold text-white text-base line-clamp-2 drop-shadow-lg mb-2">
            {item.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-white/90 mb-2">
            <span>{item.year}</span>
            <span className="flex items-center gap-1">
              ⭐ {item.rating}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/80 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 w-fit">
            <Users className="size-3.5" />
            <span className="font-medium">
              {item.watchlistCount.toLocaleString()} watching
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
