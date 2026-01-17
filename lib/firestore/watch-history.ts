import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore"
import { db, isFirebaseConfigured } from "@/lib/firebase"
import { FIREBASE_COLLECTIONS } from "@/app/constants"
import { WatchHistoryItem } from "@/types/firebase.types"

export interface WatchHistoryInput {
  userId: string
  filmId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  releaseDate: string
  runtime: number | null
  progress: number
  progressSeconds: number
  season?: number
  episode?: number
  episodeTitle?: string
}

function generateWatchHistoryId(
  userId: string,
  filmId: number,
  mediaType: "movie" | "tv",
  season?: number,
  episode?: number
): string {
  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `${userId}-${filmId}-${season}-${episode}`
  }
  return `${userId}-${filmId}-0-0`
}

export async function addOrUpdateWatchHistory(
  input: WatchHistoryInput
): Promise<WatchHistoryItem | null> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firestore is not configured")
    return null
  }

  try {
    const watchId = generateWatchHistoryId(
      input.userId,
      input.filmId,
      input.mediaType,
      input.season,
      input.episode
    )
    const watchRef = doc(db, FIREBASE_COLLECTIONS.WATCH_HISTORY, watchId)
    const existingDoc = await getDoc(watchRef)

    if (existingDoc.exists()) {
      await updateDoc(watchRef, {
        progress: input.progress,
        progressSeconds: input.progressSeconds,
        updatedAt: serverTimestamp(),
      })

      const updatedDoc = await getDoc(watchRef)
      const data = updatedDoc.data()!
      return {
        id: watchId,
        odid: watchId,
        userId: data.userId,
        filmId: data.filmId,
        mediaType: data.mediaType,
        title: data.title,
        posterPath: data.posterPath,
        backdropPath: data.backdropPath,
        voteAverage: data.voteAverage,
        releaseDate: data.releaseDate,
        runtime: data.runtime,
        progress: data.progress,
        progressSeconds: data.progressSeconds,
        season: data.season,
        episode: data.episode,
        episodeTitle: data.episodeTitle,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    }

    const watchData = {
      odid: watchId,
      userId: input.userId,
      filmId: input.filmId,
      mediaType: input.mediaType,
      title: input.title,
      posterPath: input.posterPath,
      backdropPath: input.backdropPath,
      voteAverage: input.voteAverage,
      releaseDate: input.releaseDate,
      runtime: input.runtime,
      progress: input.progress,
      progressSeconds: input.progressSeconds,
      season: input.season ?? null,
      episode: input.episode ?? null,
      episodeTitle: input.episodeTitle ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(watchRef, watchData)

    return {
      id: watchId,
      odid: watchId,
      userId: input.userId,
      filmId: input.filmId,
      mediaType: input.mediaType,
      title: input.title,
      posterPath: input.posterPath,
      backdropPath: input.backdropPath,
      voteAverage: input.voteAverage,
      releaseDate: input.releaseDate,
      runtime: input.runtime,
      progress: input.progress,
      progressSeconds: input.progressSeconds,
      season: input.season,
      episode: input.episode,
      episodeTitle: input.episodeTitle,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error adding/updating watch history:", error)
    return null
  }
}

export async function getWatchHistory(
  userId: string,
  maxItems = 20
): Promise<WatchHistoryItem[]> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firestore is not configured")
    return []
  }

  try {
    const watchHistoryRef = collection(db, FIREBASE_COLLECTIONS.WATCH_HISTORY)
    const q = query(
      watchHistoryRef,
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
      limit(maxItems)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        odid: data.odid,
        userId: data.userId,
        filmId: data.filmId,
        mediaType: data.mediaType,
        title: data.title,
        posterPath: data.posterPath,
        backdropPath: data.backdropPath,
        voteAverage: data.voteAverage,
        releaseDate: data.releaseDate,
        runtime: data.runtime,
        progress: data.progress,
        progressSeconds: data.progressSeconds,
        season: data.season ?? undefined,
        episode: data.episode ?? undefined,
        episodeTitle: data.episodeTitle ?? undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    })
  } catch (error) {
    console.error("Error fetching watch history:", error)
    return []
  }
}

export async function getContinueWatching(
  userId: string,
  maxItems = 10
): Promise<WatchHistoryItem[]> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firestore is not configured")
    return []
  }

  try {
    const watchHistoryRef = collection(db, FIREBASE_COLLECTIONS.WATCH_HISTORY)
    const q = query(
      watchHistoryRef,
      where("userId", "==", userId),
      where("progress", "<", 95),
      orderBy("progress", "desc"),
      orderBy("updatedAt", "desc"),
      limit(maxItems)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        odid: data.odid,
        userId: data.userId,
        filmId: data.filmId,
        mediaType: data.mediaType,
        title: data.title,
        posterPath: data.posterPath,
        backdropPath: data.backdropPath,
        voteAverage: data.voteAverage,
        releaseDate: data.releaseDate,
        runtime: data.runtime,
        progress: data.progress,
        progressSeconds: data.progressSeconds,
        season: data.season ?? undefined,
        episode: data.episode ?? undefined,
        episodeTitle: data.episodeTitle ?? undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    })
  } catch (error) {
    console.error("Error fetching continue watching:", error)
    return []
  }
}

export async function getWatchHistoryItem(
  userId: string,
  filmId: number,
  mediaType: "movie" | "tv",
  season?: number,
  episode?: number
): Promise<WatchHistoryItem | null> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firestore is not configured")
    return null
  }

  try {
    const watchId = generateWatchHistoryId(userId, filmId, mediaType, season, episode)
    const watchRef = doc(db, FIREBASE_COLLECTIONS.WATCH_HISTORY, watchId)
    const docSnap = await getDoc(watchRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    return {
      id: docSnap.id,
      odid: data.odid,
      userId: data.userId,
      filmId: data.filmId,
      mediaType: data.mediaType,
      title: data.title,
      posterPath: data.posterPath,
      backdropPath: data.backdropPath,
      voteAverage: data.voteAverage,
      releaseDate: data.releaseDate,
      runtime: data.runtime,
      progress: data.progress,
      progressSeconds: data.progressSeconds,
      season: data.season ?? undefined,
      episode: data.episode ?? undefined,
      episodeTitle: data.episodeTitle ?? undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    }
  } catch (error) {
    console.error("Error fetching watch history item:", error)
    return null
  }
}
