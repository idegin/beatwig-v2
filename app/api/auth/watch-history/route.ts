import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAuthToken } from "@/lib/auth-cookies"
import { verifyAuthToken } from "@/lib/server-auth"
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin"
import { FIREBASE_COLLECTIONS } from "@/app/constants"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured || !adminDb) {
    return NextResponse.json(
      { error: "Firebase not configured" },
      { status: 503 }
    )
  }

  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      filmId,
      mediaType,
      title,
      posterPath,
      backdropPath,
      voteAverage,
      releaseDate,
      runtime,
      progress,
      progressSeconds,
      season,
      episode,
      episodeTitle,
    } = body

    if (!filmId || !mediaType || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const watchId =
      mediaType === "tv" && season !== undefined && episode !== undefined
        ? `${user.uid}-${filmId}-${season}-${episode}`
        : `${user.uid}-${filmId}-0-0`

    const watchRef = adminDb.collection(FIREBASE_COLLECTIONS.WATCH_HISTORY).doc(watchId)
    const existingDoc = await watchRef.get()

    if (existingDoc.exists) {
      await watchRef.update({
        progress: progress ?? 0,
        progressSeconds: progressSeconds ?? 0,
        updatedAt: FieldValue.serverTimestamp(),
      })
    } else {
      await watchRef.set({
        odid: watchId,
        userId: user.uid,
        filmId,
        mediaType,
        title,
        posterPath: posterPath ?? null,
        backdropPath: backdropPath ?? null,
        voteAverage: voteAverage ?? 0,
        releaseDate: releaseDate ?? "",
        runtime: runtime ?? null,
        progress: progress ?? 0,
        progressSeconds: progressSeconds ?? 0,
        season: season ?? null,
        episode: episode ?? null,
        episodeTitle: episodeTitle ?? null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    }

    return NextResponse.json({ success: true, id: watchId })
  } catch (error) {
    console.error("Error updating watch history:", error)
    return NextResponse.json(
      { error: "Failed to update watch history" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  if (!isFirebaseAdminConfigured || !adminDb) {
    return NextResponse.json(
      { error: "Firebase not configured" },
      { status: 503 }
    )
  }

  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get("limit") || "20")
    const continueWatching = searchParams.get("continue") === "true"

    let query = adminDb
      .collection(FIREBASE_COLLECTIONS.WATCH_HISTORY)
      .where("userId", "==", user.uid)
      .orderBy("updatedAt", "desc")
      .limit(limitParam)

    if (continueWatching) {
      query = adminDb
        .collection(FIREBASE_COLLECTIONS.WATCH_HISTORY)
        .where("userId", "==", user.uid)
        .where("progress", "<", 95)
        .orderBy("updatedAt", "desc")
        .limit(limitParam)
    }

    const snapshot = await query.get()
    const items = snapshot.docs.map((doc) => {
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
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching watch history:", error)
    return NextResponse.json(
      { error: "Failed to fetch watch history" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  if (!isFirebaseAdminConfigured || !adminDb) {
    return NextResponse.json(
      { error: "Firebase not configured" },
      { status: 503 }
    )
  }

  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const historyId = searchParams.get("id")

    if (!historyId) {
      return NextResponse.json(
        { error: "History ID is required" },
        { status: 400 }
      )
    }

    const watchRef = adminDb.collection(FIREBASE_COLLECTIONS.WATCH_HISTORY).doc(historyId)
    const doc = await watchRef.get()

    if (!doc.exists) {
      return NextResponse.json(
        { error: "History item not found" },
        { status: 404 }
      )
    }

    const data = doc.data()
    if (data?.userId !== user.uid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    await watchRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting watch history:", error)
    return NextResponse.json(
      { error: "Failed to delete watch history" },
      { status: 500 }
    )
  }
}
