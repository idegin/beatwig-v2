import { NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth-cookies"
import { verifyAuthToken } from "@/lib/server-auth"
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin"
import { 
  FIREBASE_COLLECTIONS, 
  MAX_ALGORITHM_ITEMS,
  MAX_ALGORITHM_GENRES,
  MAX_ALGORITHM_TAGS,
} from "@/app/constants"
import { FieldValue } from "firebase-admin/firestore"
import { AlgorithmItem, AlgorithmGenre, AlgorithmTag } from "@/types/firebase.types"

function getTagCounts(tags: string[]): Map<string, number> {
  const tagCounts = new Map<string, number>()
  
  for (const tag of tags || []) {
    const normalizedTag = tag.toLowerCase().trim()
    if (normalizedTag.length > 0) {
      tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1)
    }
  }
  
  return tagCounts
}

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
      id,
      mediaType,
      image,
      backdropPath,
      country,
      title,
      tags,
      genreIds,
      genres,
      voteAverage,
      popularity,
      originalLanguage,
      releaseDate,
      watchDurationPercent,
    } = body

    if (!id || !mediaType || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const algorithmRef = adminDb
      .collection(FIREBASE_COLLECTIONS.ALGORITHM)
      .doc(user.uid)
    const existingDoc = await algorithmRef.get()

    let items: AlgorithmItem[] = []
    let genresArray: AlgorithmGenre[] = []
    let tagsArray: AlgorithmTag[] = []

    if (existingDoc.exists) {
      const data = existingDoc.data()
      items = (data?.items || []).map((item: Record<string, unknown>) => ({
        ...item,
        interactionCount: (item.interactionCount as number) || 1,
        watchDurationPercent: (item.watchDurationPercent as number) || 50,
        lastWatchedAt: (item.lastWatchedAt as FirebaseFirestore.Timestamp)?.toDate?.() || 
                       (item.lastInteractedAt as FirebaseFirestore.Timestamp)?.toDate?.() || 
                       new Date(),
        lastInteractedAt: (item.lastInteractedAt as FirebaseFirestore.Timestamp)?.toDate?.() || new Date(),
      }))
      genresArray = (data?.genres || []).map((g: Record<string, unknown>) => ({
        id: (g.id as number) || 0,
        name: (g.name as string) || "",
        rank: (g.rank as number) || 1,
        lastInteractedAt: (g.lastInteractedAt as FirebaseFirestore.Timestamp)?.toDate?.() || new Date(),
      })).filter((g: AlgorithmGenre) => g.id > 0 && g.name.length > 0)
      tagsArray = (data?.tags || []).map((t: Record<string, unknown>) => ({
        name: (t.name as string) || "",
        rank: (t.rank as number) || 1,
        lastInteractedAt: (t.lastInteractedAt as FirebaseFirestore.Timestamp)?.toDate?.() || new Date(),
      })).filter((t: AlgorithmTag) => t.name.length > 0)
    }

    const existingIndex = items.findIndex(
      (item) => item.id === id && item.mediaType === mediaType
    )

    const watchDuration = watchDurationPercent ?? 50
    const maxRank = MAX_ALGORITHM_ITEMS

    if (existingIndex !== -1) {
      const existingItem = items[existingIndex]
      const newInteractionCount = existingItem.interactionCount + 1
      
      const avgWatchDuration = (
        (existingItem.watchDurationPercent * existingItem.interactionCount) + watchDuration
      ) / newInteractionCount

      items.forEach((item, idx) => {
        if (idx !== existingIndex && item.rank > 0) {
          item.rank = Math.max(1, item.rank - 1)
        }
      })

      items[existingIndex] = {
        ...existingItem,
        rank: maxRank,
        interactionCount: newInteractionCount,
        watchDurationPercent: avgWatchDuration,
        lastWatchedAt: new Date(),
        lastInteractedAt: new Date(),
        image: image || existingItem.image,
        backdropPath: backdropPath || existingItem.backdropPath,
        tags: [...new Set([...existingItem.tags, ...(tags || [])])].slice(0, 10),
      }
    } else {
      items.forEach((item) => {
        if (item.rank > 0) {
          item.rank = Math.max(1, item.rank - 1)
        }
      })

      const newItem: AlgorithmItem = {
        id,
        mediaType,
        image: image ?? "",
        backdropPath: backdropPath ?? null,
        country: country ?? "",
        title,
        tags: (tags ?? []).slice(0, 10),
        genreIds: genreIds ?? [],
        genres: genres ?? [],
        rank: maxRank,
        interactionCount: 1,
        watchDurationPercent: watchDuration,
        voteAverage: voteAverage ?? 0,
        popularity: popularity ?? 0,
        originalLanguage: originalLanguage ?? "",
        releaseDate: releaseDate ?? "",
        lastWatchedAt: new Date(),
        lastInteractedAt: new Date(),
      }
      items.unshift(newItem)
    }

    items.sort((a, b) => {
      if (b.rank !== a.rank) return b.rank - a.rank
      return b.lastInteractedAt.getTime() - a.lastInteractedAt.getTime()
    })
    
    if (items.length > MAX_ALGORITHM_ITEMS) {
      items = items.slice(0, MAX_ALGORITHM_ITEMS)
    }

    const maxGenreRank = MAX_ALGORITHM_GENRES
    const inputGenreIds = new Set((genres || []).map((g: { id: number }) => g.id))

    genresArray.forEach((g) => {
      if (!inputGenreIds.has(g.id) && g.rank > 0) {
        g.rank = Math.max(1, g.rank - 1)
      }
    })

    for (const genre of genres || []) {
      const existingGenreIndex = genresArray.findIndex((g) => g.id === genre.id)
      if (existingGenreIndex !== -1) {
        genresArray[existingGenreIndex].rank = maxGenreRank
        genresArray[existingGenreIndex].lastInteractedAt = new Date()
      } else {
        genresArray.push({
          id: genre.id,
          name: genre.name,
          rank: maxGenreRank,
          lastInteractedAt: new Date(),
        })
      }
    }

    genresArray.sort((a, b) => {
      if (b.rank !== a.rank) return b.rank - a.rank
      return b.lastInteractedAt.getTime() - a.lastInteractedAt.getTime()
    })
    
    if (genresArray.length > MAX_ALGORITHM_GENRES) {
      genresArray = genresArray.slice(0, MAX_ALGORITHM_GENRES)
    }

    const inputTagCounts = getTagCounts(tags || [])
    const inputTagNames = new Set(inputTagCounts.keys())
    const maxTagRank = MAX_ALGORITHM_TAGS
    
    tagsArray.forEach((t) => {
      if (!inputTagNames.has(t.name.toLowerCase()) && t.rank > 0) {
        t.rank = Math.max(1, t.rank - 1)
      }
    })
    
    for (const [tagName, frequency] of inputTagCounts) {
      const existingTagIndex = tagsArray.findIndex((t) => t.name.toLowerCase() === tagName)
      const frequencyBonus = Math.min(frequency - 1, 3)
      
      if (existingTagIndex !== -1) {
        tagsArray[existingTagIndex] = {
          ...tagsArray[existingTagIndex],
          rank: maxTagRank + frequencyBonus,
          lastInteractedAt: new Date(),
        }
      } else {
        tagsArray.push({
          name: tagName,
          rank: maxTagRank + frequencyBonus,
          lastInteractedAt: new Date(),
        })
      }
    }
    
    tagsArray.sort((a, b) => {
      if (b.rank !== a.rank) return b.rank - a.rank
      return b.lastInteractedAt.getTime() - a.lastInteractedAt.getTime()
    })
    
    if (tagsArray.length > MAX_ALGORITHM_TAGS) {
      tagsArray = tagsArray.slice(0, MAX_ALGORITHM_TAGS)
    }

    const algorithmData = {
      userId: user.uid,
      items: items.map((item) => ({
        ...item,
        lastWatchedAt: item.lastWatchedAt,
        lastInteractedAt: item.lastInteractedAt,
      })),
      genres: genresArray,
      tags: tagsArray,
      updatedAt: FieldValue.serverTimestamp(),
      ...(existingDoc.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    }

    await algorithmRef.set(algorithmData, { merge: true })

    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error("Error updating algorithm:", error)
    return NextResponse.json(
      { error: "Failed to update algorithm" },
      { status: 500 }
    )
  }
}

export async function GET() {
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

    const algorithmRef = adminDb
      .collection(FIREBASE_COLLECTIONS.ALGORITHM)
      .doc(user.uid)
    const algorithmDoc = await algorithmRef.get()

    if (!algorithmDoc.exists) {
      return NextResponse.json({ items: [] })
    }

    const data = algorithmDoc.data()
    const items = (data?.items || []).map((item: Record<string, unknown>) => ({
      ...item,
      lastInteractedAt:
        (item.lastInteractedAt as FirebaseFirestore.Timestamp)?.toDate?.()?.toISOString() ||
        new Date().toISOString(),
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching algorithm:", error)
    return NextResponse.json(
      { error: "Failed to fetch algorithm" },
      { status: 500 }
    )
  }
}
