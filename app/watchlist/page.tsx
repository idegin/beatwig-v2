"use client"

import { useState } from "react"
import { PageHero } from "@/components/page-hero"
import { WatchListCard } from "@/components/cards/watch-list-card"
import { Skeleton } from "@/components/ui/skeleton"

interface WatchListItem {
  id: string
  title: string
  type: "movie" | "tv"
  image: string
  year: number
  rating: string
  watchlistCount: number
}

const mockWatchlistItems: WatchListItem[] = [
  {
    id: "507086",
    title: "Jurassic World Dominion",
    type: "movie",
    image: "https://image.tmdb.org/t/p/w500/kAVRgw7GgK1CfYEJq8ME6EvRIgU.jpg",
    year: 2022,
    rating: "6.7",
    watchlistCount: 15234
  },
  {
    id: "505642",
    title: "Black Panther: Wakanda Forever",
    type: "movie",
    image: "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
    year: 2022,
    rating: "7.4",
    watchlistCount: 23456
  },
  {
    id: "76479",
    title: "The Boys",
    type: "tv",
    image: "https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg",
    year: 2019,
    rating: "8.5",
    watchlistCount: 34567
  },
  {
    id: "550",
    title: "Fight Club",
    type: "movie",
    image: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    year: 1999,
    rating: "8.4",
    watchlistCount: 45678
  },
  {
    id: "238",
    title: "The Godfather",
    type: "movie",
    image: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    year: 1972,
    rating: "8.7",
    watchlistCount: 67890
  },
  {
    id: "95396",
    title: "Wednesday",
    type: "tv",
    image: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    year: 2022,
    rating: "8.6",
    watchlistCount: 28901
  },
  {
    id: "278",
    title: "The Shawshank Redemption",
    type: "movie",
    image: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    year: 1994,
    rating: "8.7",
    watchlistCount: 89012
  },
  {
    id: "76600",
    title: "Avatar: The Way of Water",
    type: "movie",
    image: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    year: 2022,
    rating: "7.7",
    watchlistCount: 39012
  },
  {
    id: "94997",
    title: "House of the Dragon",
    type: "tv",
    image: "https://image.tmdb.org/t/p/w500/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg",
    year: 2022,
    rating: "8.5",
    watchlistCount: 42345
  },
]

export default function WatchlistPage() {
  const [items, setItems] = useState(mockWatchlistItems)

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen">
      <PageHero
        heading="My Watchlist"
        subHeading={`${items.length} ${items.length === 1 ? 'title' : 'titles'} saved to watch later`}
        backgroundImage="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80"
        gradient="dark"
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        {items.length === 0 ? (
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
              Start adding movies and TV shows you want to watch later by clicking the bookmark icon
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {items.map((item) => (
              <WatchListCard key={item.id} item={item} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
