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

export interface TrendingFilmData {
  filmId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  backdropPath: string | null
  watchCount: number
}

export interface HotThemeData {
  name: string
  totalRank: number
  userCount: number
}

export interface CommunityFavoriteData {
  filmId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  saveCount: number
}

export async function getAppTrendingFilms(
  hoursAgo = 48,
  limit = 20
): Promise<TrendingFilmData[]> {
  if (!isFirebaseAdminConfigured || !adminDb) {
    console.warn("[getAppTrendingFilms] Firebase Admin not configured")
    return []
  }

  try {
    const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
    
    const snapshot = await adminDb
      .collection(FIREBASE_COLLECTIONS.WATCH_HISTORY)
      .where("updatedAt", ">=", cutoffDate)
      .get()

    const filmCounts = new Map<string, TrendingFilmData>()

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      const key = `${data.mediaType}_${data.filmId}`
      
      const existing = filmCounts.get(key)
      if (existing) {
        existing.watchCount++
      } else {
        filmCounts.set(key, {
          filmId: data.filmId,
          mediaType: data.mediaType,
          title: data.title,
          posterPath: data.posterPath,
          backdropPath: data.backdropPath,
          watchCount: 1,
        })
      }
    })

    const sorted = Array.from(filmCounts.values())
      .sort((a, b) => b.watchCount - a.watchCount)
      .slice(0, limit)

    console.log("[getAppTrendingFilms] Found", sorted.length, "trending films")
    return sorted
  } catch (error) {
    console.error("[getAppTrendingFilms] Error fetching trending films:", error)
    return []
  }
}

export async function getPopularOnApp(limit = 20): Promise<TrendingFilmData[]> {
  if (!isFirebaseAdminConfigured || !adminDb) {
    console.warn("[getPopularOnApp] Firebase Admin not configured")
    return []
  }

  try {
    const snapshot = await adminDb
      .collection(FIREBASE_COLLECTIONS.WATCH_HISTORY)
      .get()

    const filmCounts = new Map<string, TrendingFilmData>()

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      const key = `${data.mediaType}_${data.filmId}`
      
      const existing = filmCounts.get(key)
      if (existing) {
        existing.watchCount++
      } else {
        filmCounts.set(key, {
          filmId: data.filmId,
          mediaType: data.mediaType,
          title: data.title,
          posterPath: data.posterPath,
          backdropPath: data.backdropPath,
          watchCount: 1,
        })
      }
    })

    const sorted = Array.from(filmCounts.values())
      .sort((a, b) => b.watchCount - a.watchCount)
      .slice(0, limit)

    console.log("[getPopularOnApp] Found", sorted.length, "popular films")
    return sorted
  } catch (error) {
    console.error("[getPopularOnApp] Error fetching popular films:", error)
    return []
  }
}

export async function getHotThemesThisWeek(limit = 10): Promise<HotThemeData[]> {
  if (!isFirebaseAdminConfigured || !adminDb) {
    console.warn("[getHotThemesThisWeek] Firebase Admin not configured")
    return []
  }

  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const snapshot = await adminDb
      .collection(FIREBASE_COLLECTIONS.ALGORITHM)
      .where("updatedAt", ">=", weekAgo)
      .get()

    const themeCounts = new Map<string, HotThemeData>()

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      const tags = data.tags || []
      
      tags.forEach((tag: { name: string; rank: number }) => {
        const existing = themeCounts.get(tag.name)
        if (existing) {
          existing.totalRank += tag.rank
          existing.userCount++
        } else {
          themeCounts.set(tag.name, {
            name: tag.name,
            totalRank: tag.rank,
            userCount: 1,
          })
        }
      })
    })

    const sorted = Array.from(themeCounts.values())
      .sort((a, b) => {
        const scoreA = a.totalRank * Math.log2(a.userCount + 1)
        const scoreB = b.totalRank * Math.log2(b.userCount + 1)
        return scoreB - scoreA
      })
      .slice(0, limit)

    console.log("[getHotThemesThisWeek] Found", sorted.length, "hot themes")
    return sorted
  } catch (error) {
    console.error("[getHotThemesThisWeek] Error fetching hot themes:", error)
    return []
  }
}

export async function getCommunityFavorites(limit = 20): Promise<CommunityFavoriteData[]> {
  if (!isFirebaseAdminConfigured || !adminDb) {
    console.warn("[getCommunityFavorites] Firebase Admin not configured")
    return []
  }

  try {
    const snapshot = await adminDb
      .collection(FIREBASE_COLLECTIONS.WATCHLIST)
      .get()

    const filmCounts = new Map<string, CommunityFavoriteData>()

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      const key = `${data.mediaType}_${data.filmId}`
      
      const existing = filmCounts.get(key)
      if (existing) {
        existing.saveCount++
      } else {
        filmCounts.set(key, {
          filmId: data.filmId,
          mediaType: data.mediaType,
          title: data.title,
          posterPath: data.posterPath,
          backdropPath: data.backdropPath,
          voteAverage: data.voteAverage || 0,
          saveCount: 1,
        })
      }
    })

    const sorted = Array.from(filmCounts.values())
      .sort((a, b) => b.saveCount - a.saveCount)
      .slice(0, limit)

    console.log("[getCommunityFavorites] Found", sorted.length, "community favorites")
    return sorted
  } catch (error) {
    console.error("[getCommunityFavorites] Error fetching community favorites:", error)
    return []
  }
}

export interface RandomGenreData {
  id: number
  name: string
  userCount: number
}

export async function getRandomGenresFromAlgorithms(limit = 3): Promise<RandomGenreData[]> {
  if (!isFirebaseAdminConfigured || !adminDb) {
    console.warn("[getRandomGenresFromAlgorithms] Firebase Admin not configured")
    return []
  }

  try {
    const snapshot = await adminDb
      .collection(FIREBASE_COLLECTIONS.ALGORITHM)
      .limit(100)
      .get()

    const genreCounts = new Map<string, RandomGenreData>()

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      const genres = data.genres || []
      
      genres.forEach((genre: { id: number; name: string; rank: number }) => {
        const key = String(genre.id)
        const existing = genreCounts.get(key)
        if (existing) {
          existing.userCount++
        } else {
          genreCounts.set(key, {
            id: genre.id,
            name: genre.name,
            userCount: 1,
          })
        }
      })
    })

    const allGenres = Array.from(genreCounts.values())
    
    const shuffled = allGenres.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, limit)

    console.log("[getRandomGenresFromAlgorithms] Selected", selected.length, "random genres")
    return selected
  } catch (error) {
    console.error("[getRandomGenresFromAlgorithms] Error fetching random genres:", error)
    return []
  }
}

export async function getTop10OnApp(): Promise<TrendingFilmData[]> {
  if (!isFirebaseAdminConfigured || !adminDb) {
    console.warn("[getTop10OnApp] Firebase Admin not configured")
    return []
  }

  try {
    const snapshot = await adminDb
      .collection(FIREBASE_COLLECTIONS.WATCH_HISTORY)
      .get()

    const filmCounts = new Map<string, TrendingFilmData & { totalProgress: number; watchSessions: number }>()

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      const key = `${data.mediaType}_${data.filmId}`
      
      const existing = filmCounts.get(key)
      if (existing) {
        existing.watchCount++
        existing.totalProgress += data.progress || 0
        existing.watchSessions++
      } else {
        filmCounts.set(key, {
          filmId: data.filmId,
          mediaType: data.mediaType,
          title: data.title,
          posterPath: data.posterPath,
          backdropPath: data.backdropPath,
          watchCount: 1,
          totalProgress: data.progress || 0,
          watchSessions: 1,
        })
      }
    })

    const sorted = Array.from(filmCounts.values())
      .map(item => ({
        ...item,
        score: item.watchCount * (item.totalProgress / item.watchSessions / 100 + 0.5)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ totalProgress, watchSessions, score, ...rest }) => rest)

    console.log("[getTop10OnApp] Found", sorted.length, "top films")
    return sorted
  } catch (error) {
    console.error("[getTop10OnApp] Error fetching top 10:", error)
    return []
  }
}
