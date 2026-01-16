import { adminAuth, adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin"
import { FIREBASE_COLLECTIONS } from "@/app/constants"

export interface ServerUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface FilmBookmark {
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

export async function verifyAuthToken(token: string): Promise<ServerUser | null> {
  if (!isFirebaseAdminConfigured || !adminAuth) {
    console.warn("[verifyAuthToken] Firebase Admin not configured")
    return null
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    console.log("[verifyAuthToken] Token verified for user:", decodedToken.uid)
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      displayName: decodedToken.name || null,
      photoURL: decodedToken.picture || null,
    }
  } catch (error) {
    console.error("[verifyAuthToken] Error verifying auth token:", error)
    return null
  }
}

export async function getUserBookmarks(userId: string): Promise<FilmBookmark[]> {
  if (!isFirebaseAdminConfigured || !adminDb) {
    console.warn("[getUserBookmarks] Firebase Admin not configured")
    return []
  }

  try {
    console.log("[getUserBookmarks] Fetching bookmarks for user:", userId)
    
    const bookmarksQuery = adminDb
      .collection(FIREBASE_COLLECTIONS.WATCHLIST)
      .where("userId", "==", userId)
    
    const snapshot = await bookmarksQuery.get()
    console.log("[getUserBookmarks] Found", snapshot.size, "bookmarks")
    
    const bookmarks = snapshot.docs.map((doc) => {
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
    
    bookmarks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    
    return bookmarks
  } catch (error) {
    console.error("[getUserBookmarks] Error fetching user bookmarks:", error)
    return []
  }
}

export async function isFilmBookmarked(
  userId: string,
  filmId: number,
  mediaType: "movie" | "tv"
): Promise<boolean> {
  if (!isFirebaseAdminConfigured || !adminDb) {
    console.warn("[isFilmBookmarked] Firebase Admin not configured")
    return false
  }

  try {
    const bookmarkId = `${userId}_${mediaType}_${filmId}`
    console.log("[isFilmBookmarked] Checking bookmark:", bookmarkId)
    const bookmarkRef = adminDb
      .collection(FIREBASE_COLLECTIONS.WATCHLIST)
      .doc(bookmarkId)
    
    const bookmarkSnap = await bookmarkRef.get()
    console.log("[isFilmBookmarked] Bookmark exists:", bookmarkSnap.exists)
    return bookmarkSnap.exists
  } catch (error) {
    console.error("[isFilmBookmarked] Error checking bookmark:", error)
    return false
  }
}

export interface ServerAlgorithmItem {
  id: number
  mediaType: "movie" | "tv"
  image: string
  backdropPath: string | null
  country: string
  title: string
  tags: string[]
  genreIds: number[]
  genres: { id: number; name: string }[]
  rank: number
  interactionCount: number
  watchDurationPercent: number
  voteAverage: number
  popularity: number
  originalLanguage: string
  releaseDate: string
  lastWatchedAt: Date
  lastInteractedAt: Date
}

export interface ServerUserAlgorithm {
  userId: string
  items: ServerAlgorithmItem[]
  genres: { id: number; name: string; rank: number; lastInteractedAt: Date }[]
  tags: { name: string; rank: number; lastInteractedAt: Date }[]
  createdAt: Date
  updatedAt: Date
}

export async function getUserAlgorithm(
  userId: string
): Promise<ServerUserAlgorithm | null> {
  if (!isFirebaseAdminConfigured || !adminDb) {
    console.warn("[getUserAlgorithm] Firebase Admin not configured")
    return null
  }

  try {
    console.log("[getUserAlgorithm] Fetching algorithm for user:", userId)
    const algorithmRef = adminDb
      .collection(FIREBASE_COLLECTIONS.ALGORITHM)
      .doc(userId)

    const algorithmDoc = await algorithmRef.get()

    if (!algorithmDoc.exists) {
      console.log("[getUserAlgorithm] No algorithm found for user")
      return null
    }

    const data = algorithmDoc.data()
    const items = (data?.items || []).map((item: Record<string, unknown>) => ({
      id: item.id as number,
      mediaType: item.mediaType as "movie" | "tv",
      image: item.image as string,
      backdropPath: item.backdropPath as string | null,
      country: item.country as string,
      title: item.title as string,
      tags: (item.tags || []) as string[],
      genreIds: (item.genreIds || []) as number[],
      genres: (item.genres || []) as { id: number; name: string }[],
      rank: item.rank as number,
      interactionCount: (item.interactionCount as number) || 1,
      watchDurationPercent: (item.watchDurationPercent as number) || 50,
      voteAverage: item.voteAverage as number,
      popularity: item.popularity as number,
      originalLanguage: item.originalLanguage as string,
      releaseDate: item.releaseDate as string,
      lastWatchedAt:
        (item.lastWatchedAt as FirebaseFirestore.Timestamp)?.toDate?.() ||
        (item.lastInteractedAt as FirebaseFirestore.Timestamp)?.toDate?.() ||
        new Date(),
      lastInteractedAt:
        (item.lastInteractedAt as FirebaseFirestore.Timestamp)?.toDate?.() ||
        new Date(),
    }))

    console.log("[getUserAlgorithm] Found", items.length, "algorithm items")
    return {
      userId: data?.userId,
      items,
      genres: (data?.genres || []).map((g: Record<string, unknown>) => ({
        id: g.id as number,
        name: g.name as string,
        rank: g.rank as number,
        lastInteractedAt:
          (g.lastInteractedAt as FirebaseFirestore.Timestamp)?.toDate?.() ||
          new Date(),
      })),
      tags: (data?.tags || []).map((t: Record<string, unknown>) => ({
        name: t.name as string,
        rank: t.rank as number,
        lastInteractedAt:
          (t.lastInteractedAt as FirebaseFirestore.Timestamp)?.toDate?.() ||
          new Date(),
      })),
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
    }
  } catch (error) {
    console.error("[getUserAlgorithm] Error fetching user algorithm:", error)
    return null
  }
}

export async function getUserWatchHistory(
  userId: string,
  maxItems = 10,
  continueWatching = false
): Promise<{
  id: string
  filmId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  backdropPath: string | null
  progress: number
  progressSeconds: number
  season?: number
  episode?: number
  updatedAt: Date
}[]> {
  if (!isFirebaseAdminConfigured || !adminDb) {
    console.warn("[getUserWatchHistory] Firebase Admin not configured")
    return []
  }

  try {
    console.log("[getUserWatchHistory] Fetching watch history for user:", userId)
    
    let query = adminDb
      .collection(FIREBASE_COLLECTIONS.WATCH_HISTORY)
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc")
      .limit(maxItems)

    if (continueWatching) {
      query = adminDb
        .collection(FIREBASE_COLLECTIONS.WATCH_HISTORY)
        .where("userId", "==", userId)
        .where("progress", "<", 95)
        .orderBy("updatedAt", "desc")
        .limit(maxItems)
    }

    const snapshot = await query.get()
    console.log("[getUserWatchHistory] Found", snapshot.size, "items")

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        filmId: data.filmId,
        mediaType: data.mediaType,
        title: data.title,
        posterPath: data.posterPath,
        backdropPath: data.backdropPath,
        progress: data.progress,
        progressSeconds: data.progressSeconds,
        season: data.season ?? undefined,
        episode: data.episode ?? undefined,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    })
  } catch (error) {
    console.error("[getUserWatchHistory] Error fetching watch history:", error)
    return []
  }
}

export async function getFilmWatchHistory(
  userId: string,
  filmId: number,
  mediaType: "movie" | "tv",
  maxItems = 5
): Promise<{
  season?: number
  episode?: number
  progress: number
  updatedAt: Date
}[]> {
  if (!isFirebaseAdminConfigured || !adminDb) {
    console.warn("[getFilmWatchHistory] Firebase Admin not configured")
    return []
  }

  try {
    console.log("[getFilmWatchHistory] Fetching history for film:", filmId)
    
    const snapshot = await adminDb
      .collection(FIREBASE_COLLECTIONS.WATCH_HISTORY)
      .where("userId", "==", userId)
      .where("filmId", "==", filmId)
      .where("mediaType", "==", mediaType)
      .orderBy("updatedAt", "desc")
      .limit(maxItems)
      .get()

    console.log("[getFilmWatchHistory] Found", snapshot.size, "items")

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        season: data.season ?? undefined,
        episode: data.episode ?? undefined,
        progress: data.progress,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    })
  } catch (error) {
    console.error("[getFilmWatchHistory] Error fetching film watch history:", error)
    return []
  }
}
