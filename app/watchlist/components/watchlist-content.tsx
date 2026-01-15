"use client"

import { useState } from "react"
import Link from "next/link"
import { X, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilmBookmark } from "@/lib/server-auth"
import { TMDB_IMAGE_BASE } from "@/app/constants"

interface WatchlistContentProps {
  initialBookmarks: FilmBookmark[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

export function WatchlistContent({ initialBookmarks }: WatchlistContentProps) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks)

  const handleRemove = async (filmId: number, mediaType: "movie" | "tv") => {
    try {
      const response = await fetch(
        `/api/watchlist?filmId=${filmId}&mediaType=${mediaType}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        setBookmarks((prev) =>
          prev.filter(
            (b) => !(b.filmId === filmId && b.mediaType === mediaType)
          )
        )
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error)
    }
  }

  if (bookmarks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-12 text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Your watchlist is empty</h2>
          <p className="text-muted-foreground max-w-md">
            Start adding movies and TV shows you want to watch later by clicking
            the bookmark icon
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {bookmarks.map((bookmark) => {
          const year = bookmark.releaseDate
            ? new Date(bookmark.releaseDate).getFullYear()
            : ""
          const href = `/film/${bookmark.mediaType}/${bookmark.filmId}/${slugify(bookmark.title)}`
          const posterUrl = bookmark.posterPath
            ? `${TMDB_IMAGE_BASE}/w500${bookmark.posterPath}`
            : "/placeholder-poster.jpg"

          return (
            <div key={bookmark.id} className="group relative">
              <Link href={href} className="block">
                <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl">
                  <img
                    src={posterUrl}
                    alt={bookmark.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-lg z-10">
                    <Bookmark className="size-3.5 fill-current text-primary-foreground" />
                    <span className="text-xs font-bold text-primary-foreground uppercase">
                      {bookmark.mediaType === "movie" ? "Movie" : "TV"}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-0 md:translate-y-full opacity-100 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300">
                    <h3 className="font-bold text-white text-base line-clamp-2 drop-shadow-lg mb-2">
                      {bookmark.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-white/90">
                      {year && <span>{year}</span>}
                      {bookmark.voteAverage > 0 && (
                        <span className="flex items-center gap-1">
                          ⭐ {bookmark.voteAverage.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              <Button
                size="icon"
                variant="destructive"
                className="absolute top-3 right-3 size-9 rounded-full shadow-lg hover:scale-110 transition-transform opacity-100 md:opacity-0 md:group-hover:opacity-100 z-50"
                onClick={() => handleRemove(bookmark.filmId, bookmark.mediaType)}
              >
                <X className="size-4" />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
