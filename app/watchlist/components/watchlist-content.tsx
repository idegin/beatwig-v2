"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHero } from "@/components/page-hero"
import { TMDB_IMAGE_BASE, FIREBASE_COLLECTIONS } from "@/app/constants"
import { useAuth } from "@/context/auth-context"
import { db, isFirebaseConfigured } from "@/lib/firebase"
import { collection, query, where, getDocs, deleteDoc, doc, orderBy, getDoc } from "firebase/firestore"

interface FilmBookmark {
  id: string
  filmId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  releaseDate: string
  overview: string
  createdAt: Date
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

function WatchlistSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-2/3 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function WatchlistContent() {
  const { authState, isAuthenticated } = useAuth()
  const [bookmarks, setBookmarks] = useState<FilmBookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const user = authState.user || authState.serverUser

  useEffect(() => {
    async function fetchBookmarks() {
      if (!isAuthenticated || !user) {
        console.log("[WatchlistContent] Not authenticated, skipping fetch")
        setIsLoading(false)
        setBookmarks([])
        return
      }

      if (!isFirebaseConfigured || !db) {
        console.error("[WatchlistContent] Firebase not configured")
        setError("Firebase is not configured")
        setIsLoading(false)
        return
      }

      try {
        console.log("[WatchlistContent] Fetching bookmarks for user:", user.uid)
        setIsLoading(true)
        setError(null)

        const bookmarksQuery = query(
          collection(db, FIREBASE_COLLECTIONS.WATCHLIST),
          where("users_ids", "array-contains", user.uid)
        )

        const snapshot = await getDocs(bookmarksQuery)
        console.log("[WatchlistContent] Found", snapshot.size, "bookmarks")

        const fetchedBookmarks: FilmBookmark[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            filmId: data.filmId,
            mediaType: data.mediaType,
            title: data.title,
            posterPath: data.posterPath,
            backdropPath: data.backdropPath,
            voteAverage: data.voteAverage,
            releaseDate: data.releaseDate,
            overview: data.overview,
            createdAt: data.createdAt?.toDate() || new Date(),
          }
        })

        fetchedBookmarks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        setBookmarks(fetchedBookmarks)
        console.log("[WatchlistContent] Successfully loaded bookmarks")
      } catch (err) {
        console.error("[WatchlistContent] Error fetching bookmarks:", err)
        if (err instanceof Error) {
          console.error("[WatchlistContent] Error details:", {
            name: err.name,
            message: err.message,
            stack: err.stack
          })
          setError(err.message)
        } else {
          setError("Failed to load watchlist")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookmarks()
  }, [isAuthenticated, user])

  const handleRemove = async (filmId: number, mediaType: "movie" | "tv") => {
    if (!user || !isFirebaseConfigured || !db) {
      console.error("[WatchlistContent] Cannot remove: user or firebase not configured")
      return
    }

    try {
      console.log("[WatchlistContent] Removing bookmark:", { filmId, mediaType })
      const bookmarkId = String(filmId)
      const bookmarkRef = doc(db, FIREBASE_COLLECTIONS.WATCHLIST, bookmarkId)

      const bookmarkSnap = await getDoc(bookmarkRef)
      
      if (bookmarkSnap.exists()) {
        const data = bookmarkSnap.data()
        const usersIds = data.users_ids || []
        
        if (usersIds.length <= 1) {
          console.log("[WatchlistContent] Last user, deleting document")
          await deleteDoc(bookmarkRef)
        } else {
          console.log("[WatchlistContent] Removing user from users_ids")
          const { arrayRemove, updateDoc } = await import("firebase/firestore")
          await updateDoc(bookmarkRef, {
            users_ids: arrayRemove(user.uid),
            updatedAt: new Date(),
          })
        }
      }

      setBookmarks((prev) =>
        prev.filter(
          (b) => !(b.filmId === filmId && b.mediaType === mediaType)
        )
      )
      console.log("[WatchlistContent] Successfully removed bookmark")
    } catch (err) {
      console.error("[WatchlistContent] Error removing bookmark:", err)
      if (err instanceof Error) {
        console.error("[WatchlistContent] Error details:", {
          name: err.name,
          message: err.message,
          stack: err.stack
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PageHero
          heading="My Watchlist"
          subHeading="Loading your saved titles..."
          backgroundImage="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80"
          gradient="dark"
        />
        <WatchlistSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <PageHero
          heading="My Watchlist"
          subHeading="Error loading watchlist"
          backgroundImage="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80"
          gradient="dark"
        />
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-24 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
              <X className="size-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Error loading watchlist</h2>
            <p className="text-muted-foreground max-w-md">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <PageHero
          heading="My Watchlist"
          subHeading="Sign in to view your watchlist"
          backgroundImage="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80"
          gradient="dark"
        />
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Bookmark className="size-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Sign in to view your watchlist</h2>
            <p className="text-muted-foreground max-w-md">
              Create a free account to save movies and TV shows to watch later
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="min-h-screen">
        <PageHero
          heading="My Watchlist"
          subHeading="0 titles saved to watch later"
          backgroundImage="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80"
          gradient="dark"
        />
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
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PageHero
        heading="My Watchlist"
        subHeading={`${bookmarks.length} ${bookmarks.length === 1 ? 'title' : 'titles'} saved to watch later`}
        backgroundImage="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80"
        gradient="dark"
      />
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
    </div>
  )
}
