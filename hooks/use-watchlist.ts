"use client"

import * as React from "react"
import { useAuth } from "@/context/auth-context"
import { db, isFirebaseConfigured } from "@/lib/firebase"
import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  updateDoc 
} from "firebase/firestore"
import { FIREBASE_COLLECTIONS } from "@/app/constants"

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
  const { authState, isAuthenticated } = useAuth()
  const [isInWatchlist, setIsInWatchlist] = React.useState(initialIsBookmarked)
  const [isLoading, setIsLoading] = React.useState(false)

  const user = authState.user || authState.serverUser

  const checkBookmark = React.useCallback(
    async (filmId: number, mediaType: "movie" | "tv") => {
      if (!isAuthenticated || !user) {
        console.log("[useWatchlist] Not authenticated, skipping check")
        setIsInWatchlist(false)
        return
      }

      if (!isFirebaseConfigured || !db) {
        console.error("[useWatchlist] Firebase not configured")
        return
      }

      try {
        console.log("[useWatchlist] Checking bookmark:", { userId: user.uid, filmId, mediaType })
        const bookmarkId = String(filmId)
        const bookmarkRef = doc(db, FIREBASE_COLLECTIONS.WATCHLIST, bookmarkId)
        const bookmarkSnap = await getDoc(bookmarkRef)
        
        if (bookmarkSnap.exists()) {
          const data = bookmarkSnap.data()
          const usersIds = data.users_ids || []
          const exists = usersIds.includes(user.uid)
          console.log("[useWatchlist] User in watchlist:", exists)
          setIsInWatchlist(exists)
        } else {
          console.log("[useWatchlist] Bookmark document doesn't exist")
          setIsInWatchlist(false)
        }
      } catch (error) {
        console.error("[useWatchlist] Error checking bookmark:", error)
        if (error instanceof Error) {
          console.error("[useWatchlist] Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack
          })
        }
      }
    },
    [isAuthenticated, user]
  )

  const addToWatchlist = React.useCallback(
    async (data: FilmBookmarkData) => {
      if (!isAuthenticated || !user) {
        console.error("[useWatchlist] Not authenticated")
        return
      }

      if (!isFirebaseConfigured || !db) {
        console.error("[useWatchlist] Firebase not configured")
        return
      }

      setIsLoading(true)
      try {
        console.log("[useWatchlist] Adding to watchlist:", { userId: user.uid, ...data })
        
        const bookmarkId = String(data.filmId)
        const bookmarkRef = doc(db, FIREBASE_COLLECTIONS.WATCHLIST, bookmarkId)
        
        const bookmarkSnap = await getDoc(bookmarkRef)
        
        if (bookmarkSnap.exists()) {
          console.log("[useWatchlist] Bookmark exists, adding user to users_ids")
          await updateDoc(bookmarkRef, {
            users_ids: arrayUnion(user.uid),
            updatedAt: serverTimestamp(),
          })
        } else {
          console.log("[useWatchlist] Creating new bookmark with user")
          await setDoc(bookmarkRef, {
            filmId: data.filmId,
            mediaType: data.mediaType,
            title: data.title,
            posterPath: data.posterPath,
            backdropPath: data.backdropPath,
            voteAverage: data.voteAverage,
            releaseDate: data.releaseDate,
            overview: data.overview,
            users_ids: [user.uid],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        }
        
        console.log("[useWatchlist] Successfully added to watchlist")
        setIsInWatchlist(true)
      } catch (error) {
        console.error("[useWatchlist] Error adding to watchlist:", error)
        if (error instanceof Error) {
          console.error("[useWatchlist] Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack
          })
        }
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, user]
  )

  const removeFromWatchlist = React.useCallback(
    async (filmId: number, mediaType: "movie" | "tv") => {
      if (!isAuthenticated || !user) {
        console.error("[useWatchlist] Not authenticated")
        return
      }

      if (!isFirebaseConfigured || !db) {
        console.error("[useWatchlist] Firebase not configured")
        return
      }

      setIsLoading(true)
      try {
        console.log("[useWatchlist] Removing from watchlist:", { userId: user.uid, filmId, mediaType })
        
        const bookmarkId = String(filmId)
        const bookmarkRef = doc(db, FIREBASE_COLLECTIONS.WATCHLIST, bookmarkId)
        
        const bookmarkSnap = await getDoc(bookmarkRef)
        
        if (bookmarkSnap.exists()) {
          const data = bookmarkSnap.data()
          const usersIds = data.users_ids || []
          
          if (usersIds.length <= 1) {
            console.log("[useWatchlist] Last user, deleting document")
            await deleteDoc(bookmarkRef)
          } else {
            console.log("[useWatchlist] Removing user from users_ids")
            await updateDoc(bookmarkRef, {
              users_ids: arrayRemove(user.uid),
              updatedAt: serverTimestamp(),
            })
          }
        }
        
        console.log("[useWatchlist] Successfully removed from watchlist")
        setIsInWatchlist(false)
      } catch (error) {
        console.error("[useWatchlist] Error removing from watchlist:", error)
        if (error instanceof Error) {
          console.error("[useWatchlist] Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack
          })
        }
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, user]
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
