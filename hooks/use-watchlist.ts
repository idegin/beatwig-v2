"use client"

import * as React from "react"
import { useAuth } from "@/context/auth-context"

interface FilmBookmarkData {
  filmId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  releaseDate: string
  overview: string
}

interface UseWatchlistReturn {
  isInWatchlist: boolean
  isLoading: boolean
  addToWatchlist: (data: FilmBookmarkData) => Promise<void>
  removeFromWatchlist: (filmId: number, mediaType: "movie" | "tv") => Promise<void>
  toggleWatchlist: (data: FilmBookmarkData) => Promise<void>
  checkBookmark: (filmId: number, mediaType: "movie" | "tv") => Promise<void>
}

export function useWatchlist(
  initialIsBookmarked: boolean = false
): UseWatchlistReturn {
  const { isAuthenticated } = useAuth()
  const [isInWatchlist, setIsInWatchlist] = React.useState(initialIsBookmarked)
  const [isLoading, setIsLoading] = React.useState(false)

  const checkBookmark = React.useCallback(
    async (filmId: number, mediaType: "movie" | "tv") => {
      if (!isAuthenticated) {
        setIsInWatchlist(false)
        return
      }

      try {
        const response = await fetch(
          `/api/watchlist?filmId=${filmId}&mediaType=${mediaType}`
        )
        if (response.ok) {
          const data = await response.json()
          setIsInWatchlist(data.isBookmarked)
        }
      } catch (error) {
        console.error("Error checking bookmark:", error)
      }
    },
    [isAuthenticated]
  )

  const addToWatchlist = React.useCallback(
    async (data: FilmBookmarkData) => {
      if (!isAuthenticated) return

      setIsLoading(true)
      try {
        const response = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          setIsInWatchlist(true)
        }
      } catch (error) {
        console.error("Error adding to watchlist:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated]
  )

  const removeFromWatchlist = React.useCallback(
    async (filmId: number, mediaType: "movie" | "tv") => {
      if (!isAuthenticated) return

      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/watchlist?filmId=${filmId}&mediaType=${mediaType}`,
          { method: "DELETE" }
        )

        if (response.ok) {
          setIsInWatchlist(false)
        }
      } catch (error) {
        console.error("Error removing from watchlist:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated]
  )

  const toggleWatchlist = React.useCallback(
    async (data: FilmBookmarkData) => {
      if (isInWatchlist) {
        await removeFromWatchlist(data.filmId, data.mediaType)
      } else {
        await addToWatchlist(data)
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  )

  return {
    isInWatchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    checkBookmark,
  }
}
