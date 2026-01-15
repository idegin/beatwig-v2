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
      .collection(FIREBASE_COLLECTIONS.FILM_BOOKMARKS)
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
      .collection(FIREBASE_COLLECTIONS.FILM_BOOKMARKS)
      .doc(bookmarkId)
    
    const bookmarkSnap = await bookmarkRef.get()
    console.log("[isFilmBookmarked] Bookmark exists:", bookmarkSnap.exists)
    return bookmarkSnap.exists
  } catch (error) {
    console.error("[isFilmBookmarked] Error checking bookmark:", error)
    return false
  }
}
