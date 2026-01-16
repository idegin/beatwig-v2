import { NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth-cookies"
import { verifyAuthToken } from "@/lib/server-auth"
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin"
import { 
  FIREBASE_COLLECTIONS, 
  MAX_ALGORITHM_ITEMS,
  MAX_ALGORITHM_GENRES,
  MAX_ALGORITHM_TAGS,
  TV_EPISODE_RANK_MULTIPLIER,
  TV_BASE_RANK_CAP,
  MOVIE_BASE_RANK,
  ALGORITHM_RECENCY_DECAY_DAYS,
  ALGORITHM_RECENCY_WEIGHT,
  ALGORITHM_RANK_WEIGHT,
  TAG_FREQUENCY_BOOST,
  TAG_RECENCY_WEIGHT,
} from "@/app/constants"
import { FieldValue } from "firebase-admin/firestore"
import { AlgorithmItem, AlgorithmGenre, AlgorithmTag } from "@/types/firebase.types"

function calculateRecencyScore(lastInteractedAt: Date): number {
  const now = new Date()
  const daysSinceInteraction = Math.floor(
    (now.getTime() - lastInteractedAt.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysSinceInteraction <= 0) return 1
  if (daysSinceInteraction >= ALGORITHM_RECENCY_DECAY_DAYS) return 0.1
  
  return Math.max(0.1, 1 - (daysSinceInteraction / ALGORITHM_RECENCY_DECAY_DAYS) * 0.9)
}

function calculateEffectiveRank(item: AlgorithmItem): number {
  const recencyScore = calculateRecencyScore(item.lastInteractedAt)
  const normalizedRank = Math.min(item.rank, 20) / 20
  const watchScore = item.watchDurationPercent > 0 
    ? item.watchDurationPercent / 100 
    : 0.5
  
  const effectiveRank = 
    (normalizedRank * ALGORITHM_RANK_WEIGHT) +
    (recencyScore * ALGORITHM_RECENCY_WEIGHT) +
    (watchScore * (1 - ALGORITHM_RANK_WEIGHT - ALGORITHM_RECENCY_WEIGHT))
  
  return effectiveRank * 100
}

function calculateRankIncrement(
  mediaType: "movie" | "tv", 
  currentInteractionCount: number,
  watchDurationPercent: number = 50
): number {
  const completionBonus = watchDurationPercent > 80 ? 0.5 : 
                          watchDurationPercent > 50 ? 0.25 : 0
  
  if (mediaType === "movie") {
    return MOVIE_BASE_RANK + completionBonus
  }
  
  const episodeIncrement = Math.max(0.1, TV_EPISODE_RANK_MULTIPLIER * (1 / Math.log2(currentInteractionCount + 2)))
  const cappedRank = Math.min(TV_BASE_RANK_CAP, episodeIncrement + completionBonus)
  
  return cappedRank
}

function calculateTagRank(
  existingRank: number,
  existingLastInteractedAt: Date,
  newFrequency: number
): number {
  const recencyScore = calculateRecencyScore(existingLastInteractedAt)
  const frequencyBoost = Math.min(1, newFrequency * TAG_FREQUENCY_BOOST)
  
  const newRank = existingRank + 
    (1 * (1 - TAG_RECENCY_WEIGHT)) + 
    (recencyScore * TAG_RECENCY_WEIGHT) + 
    frequencyBoost
  
  return newRank
}

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
        ...g,
        lastInteractedAt: (g.lastInteractedAt as FirebaseFirestore.Timestamp)?.toDate?.() || new Date(),
      }))
      tagsArray = (data?.tags || []).map((t: Record<string, unknown>) => ({
        ...t,
        lastInteractedAt: (t.lastInteractedAt as FirebaseFirestore.Timestamp)?.toDate?.() || new Date(),
      }))
    }

    const existingIndex = items.findIndex(
      (item) => item.id === id && item.mediaType === mediaType
    )

    const watchDuration = watchDurationPercent ?? 50

    if (existingIndex !== -1) {
      const existingItem = items[existingIndex]
      const newInteractionCount = existingItem.interactionCount + 1
      const rankIncrement = calculateRankIncrement(
        mediaType, 
        newInteractionCount,
        watchDuration
      )
      
      const avgWatchDuration = (
        (existingItem.watchDurationPercent * existingItem.interactionCount) + watchDuration
      ) / newInteractionCount

      items[existingIndex] = {
        ...existingItem,
        rank: existingItem.rank + rankIncrement,
        interactionCount: newInteractionCount,
        watchDurationPercent: avgWatchDuration,
        lastWatchedAt: new Date(),
        lastInteractedAt: new Date(),
        image: image || existingItem.image,
        backdropPath: backdropPath || existingItem.backdropPath,
        tags: [...new Set([...existingItem.tags, ...(tags || [])])].slice(0, 10),
      }
    } else {
      const rankIncrement = calculateRankIncrement(mediaType, 1, watchDuration)
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
        rank: rankIncrement,
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

    items.sort((a, b) => calculateEffectiveRank(b) - calculateEffectiveRank(a))
    if (items.length > MAX_ALGORITHM_ITEMS) {
      items = items.slice(0, MAX_ALGORITHM_ITEMS)
    }

    for (const genre of genres || []) {
      const existingGenreIndex = genresArray.findIndex((g) => g.id === genre.id)
      if (existingGenreIndex !== -1) {
        const existingGenre = genresArray[existingGenreIndex]
        const recencyScore = calculateRecencyScore(existingGenre.lastInteractedAt)
        genresArray[existingGenreIndex].rank = existingGenre.rank + (1 * (0.5 + recencyScore * 0.5))
        genresArray[existingGenreIndex].lastInteractedAt = new Date()
      } else {
        genresArray.push({
          id: genre.id,
          name: genre.name,
          rank: 1,
          lastInteractedAt: new Date(),
        })
      }
    }
    genresArray.sort((a, b) => {
      const aScore = a.rank * calculateRecencyScore(a.lastInteractedAt)
      const bScore = b.rank * calculateRecencyScore(b.lastInteractedAt)
      return bScore - aScore
    })
    if (genresArray.length > MAX_ALGORITHM_GENRES) {
      genresArray = genresArray.slice(0, MAX_ALGORITHM_GENRES)
    }

    const inputTagCounts = getTagCounts(tags || [])
    
    for (const [tagName, frequency] of inputTagCounts) {
      const existingTagIndex = tagsArray.findIndex((t) => t.name.toLowerCase() === tagName)
      
      if (existingTagIndex !== -1) {
        const existingTag = tagsArray[existingTagIndex]
        tagsArray[existingTagIndex] = {
          ...existingTag,
          rank: calculateTagRank(existingTag.rank, existingTag.lastInteractedAt, frequency),
          lastInteractedAt: new Date(),
        }
      } else {
        tagsArray.push({
          name: tagName,
          rank: 1 + (frequency * TAG_FREQUENCY_BOOST),
          lastInteractedAt: new Date(),
        })
      }
    }
    tagsArray.sort((a, b) => {
      const aScore = a.rank * calculateRecencyScore(a.lastInteractedAt)
      const bScore = b.rank * calculateRecencyScore(b.lastInteractedAt)
      return bScore - aScore
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
