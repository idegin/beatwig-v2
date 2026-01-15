import { NextResponse } from "next/server"
import { adminAuth, adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin"
import { getAuthToken } from "@/lib/auth-cookies"
import { FIREBASE_COLLECTIONS } from "@/app/constants"

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

export async function GET(request: Request) {
  try {
    console.log("[Watchlist GET] Request received")
    
    if (!isFirebaseAdminConfigured || !adminAuth || !adminDb) {
      console.error("[Watchlist GET] Firebase not configured", {
        isFirebaseAdminConfigured,
        hasAdminAuth: !!adminAuth,
        hasAdminDb: !!adminDb
      })
      return NextResponse.json(
        { error: "Firebase not configured" },
        { status: 500 }
      )
    }

    const token = await getAuthToken()
    console.log("[Watchlist GET] Auth token:", token ? "present" : "missing")
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("[Watchlist GET] Verifying token...")
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid
    console.log("[Watchlist GET] User ID:", userId)

    const { searchParams } = new URL(request.url)
    const filmId = searchParams.get("filmId")
    const mediaType = searchParams.get("mediaType")
    console.log("[Watchlist GET] Params:", { filmId, mediaType })

    if (filmId && mediaType) {
      const bookmarkId = `${userId}_${mediaType}_${filmId}`
      console.log("[Watchlist GET] Checking bookmark:", bookmarkId)
      
      const bookmarkRef = adminDb
        .collection(FIREBASE_COLLECTIONS.FILM_BOOKMARKS)
        .doc(bookmarkId)
      
      const bookmarkSnap = await bookmarkRef.get()
      console.log("[Watchlist GET] Bookmark exists:", bookmarkSnap.exists)
      
      return NextResponse.json({
        isBookmarked: bookmarkSnap.exists,
        bookmark: bookmarkSnap.exists ? bookmarkSnap.data() : null,
      })
    }

    console.log("[Watchlist GET] Fetching all bookmarks for user...")
    const bookmarksQuery = adminDb
      .collection(FIREBASE_COLLECTIONS.FILM_BOOKMARKS)
      .where("userId", "==", userId)
    
    const snapshot = await bookmarksQuery.get()
    console.log("[Watchlist GET] Found", snapshot.size, "bookmarks")
    
    const bookmarks: FilmBookmark[] = snapshot.docs.map((doc) => {
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

    return NextResponse.json({ bookmarks })
  } catch (error) {
    console.error("[Watchlist GET] Error:", error)
    console.error("[Watchlist GET] Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: "Failed to fetch bookmarks", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("[Watchlist POST] Request received")
    
    if (!isFirebaseAdminConfigured || !adminAuth || !adminDb) {
      console.error("[Watchlist POST] Firebase not configured")
      return NextResponse.json(
        { error: "Firebase not configured" },
        { status: 500 }
      )
    }

    const token = await getAuthToken()
    console.log("[Watchlist POST] Auth token:", token ? "present" : "missing")
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("[Watchlist POST] Verifying token...")
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid
    console.log("[Watchlist POST] User ID:", userId)

    const body = await request.json()
    const { filmId, mediaType, title, posterPath, backdropPath, voteAverage, releaseDate, overview } = body
    console.log("[Watchlist POST] Body:", { filmId, mediaType, title })

    if (!filmId || !mediaType || !title) {
      console.error("[Watchlist POST] Missing required fields")
      return NextResponse.json(
        { error: "filmId, mediaType, and title are required" },
        { status: 400 }
      )
    }

    const bookmarkId = `${userId}_${mediaType}_${filmId}`
    console.log("[Watchlist POST] Creating bookmark:", bookmarkId)
    
    const bookmarkRef = adminDb
      .collection(FIREBASE_COLLECTIONS.FILM_BOOKMARKS)
      .doc(bookmarkId)

    await bookmarkRef.set({
      userId,
      filmId,
      mediaType,
      title,
      posterPath: posterPath || null,
      backdropPath: backdropPath || null,
      voteAverage: voteAverage || 0,
      releaseDate: releaseDate || "",
      overview: overview || "",
      createdAt: new Date(),
    })
    
    console.log("[Watchlist POST] Bookmark created successfully")

    return NextResponse.json({ success: true, bookmarkId })
  } catch (error) {
    console.error("[Watchlist POST] Error:", error)
    console.error("[Watchlist POST] Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: "Failed to add bookmark", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    console.log("[Watchlist DELETE] Request received")
    
    if (!isFirebaseAdminConfigured || !adminAuth || !adminDb) {
      console.error("[Watchlist DELETE] Firebase not configured")
      return NextResponse.json(
        { error: "Firebase not configured" },
        { status: 500 }
      )
    }

    const token = await getAuthToken()
    console.log("[Watchlist DELETE] Auth token:", token ? "present" : "missing")
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("[Watchlist DELETE] Verifying token...")
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid
    console.log("[Watchlist DELETE] User ID:", userId)

    const { searchParams } = new URL(request.url)
    const filmId = searchParams.get("filmId")
    const mediaType = searchParams.get("mediaType")
    console.log("[Watchlist DELETE] Params:", { filmId, mediaType })

    if (!filmId || !mediaType) {
      console.error("[Watchlist DELETE] Missing required params")
      return NextResponse.json(
        { error: "filmId and mediaType are required" },
        { status: 400 }
      )
    }

    const bookmarkId = `${userId}_${mediaType}_${filmId}`
    console.log("[Watchlist DELETE] Deleting bookmark:", bookmarkId)
    
    const bookmarkRef = adminDb
      .collection(FIREBASE_COLLECTIONS.FILM_BOOKMARKS)
      .doc(bookmarkId)

    await bookmarkRef.delete()
    console.log("[Watchlist DELETE] Bookmark deleted successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Watchlist DELETE] Error:", error)
    console.error("[Watchlist DELETE] Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: "Failed to remove bookmark", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
