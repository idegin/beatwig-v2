import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db, isFirebaseConfigured } from "@/lib/firebase"
import { 
  FIREBASE_COLLECTIONS, 
  MAX_ALGORITHM_ITEMS,
  MAX_ALGORITHM_GENRES,
  MAX_ALGORITHM_TAGS,
  ALGORITHM_RECENCY_DECAY_DAYS,
} from "@/app/constants"
import { AlgorithmItem, AlgorithmGenre, AlgorithmTag, UserAlgorithm } from "@/types/firebase.types"

export interface AlgorithmInput {
  userId: string
  id: number
  mediaType: "movie" | "tv"
  image: string
  backdropPath: string | null
  country: string
  title: string
  tags: string[]
  genreIds: number[]
  genres: { id: number; name: string }[]
  voteAverage: number
  popularity: number
  originalLanguage: string
  releaseDate: string
  watchDurationPercent?: number
  episodeNumber?: number
}

function calculateRecencyScore(lastInteractedAt: Date): number {
  const now = new Date()
  const daysSinceInteraction = Math.floor(
    (now.getTime() - lastInteractedAt.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysSinceInteraction <= 0) return 1
  if (daysSinceInteraction >= ALGORITHM_RECENCY_DECAY_DAYS) return 0.1
  
  return Math.max(0.1, 1 - (daysSinceInteraction / ALGORITHM_RECENCY_DECAY_DAYS) * 0.9)
}

function getTagsFromItem(input: AlgorithmInput): Map<string, number> {
  const tagCounts = new Map<string, number>()
  
  for (const tag of input.tags) {
    const normalizedTag = tag.toLowerCase().trim()
    if (normalizedTag.length > 0) {
      tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1)
    }
  }
  
  return tagCounts
}

export async function addOrUpdateAlgorithm(
  input: AlgorithmInput
): Promise<UserAlgorithm | null> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firestore is not configured")
    return null
  }

  try {
    const algorithmRef = doc(db, FIREBASE_COLLECTIONS.ALGORITHM, input.userId)
    const existingDoc = await getDoc(algorithmRef)

    let items: AlgorithmItem[] = []
    let genres: AlgorithmGenre[] = []
    let tags: AlgorithmTag[] = []

    if (existingDoc.exists()) {
      const data = existingDoc.data()
      items = (data.items || []).map((item: Record<string, unknown>) => ({
        ...item,
        interactionCount: (item.interactionCount as number) || 1,
        watchDurationPercent: (item.watchDurationPercent as number) || 50,
        lastWatchedAt: (item.lastWatchedAt as Timestamp)?.toDate?.() || 
                       (item.lastInteractedAt as Timestamp)?.toDate?.() || 
                       new Date(),
        lastInteractedAt: (item.lastInteractedAt as Timestamp)?.toDate?.() || new Date(),
      }))
      genres = (data.genres || []).map((g: Record<string, unknown>) => ({
        id: (g.id as number) || 0,
        name: (g.name as string) || "",
        rank: (g.rank as number) || 1,
        lastInteractedAt: (g.lastInteractedAt as Timestamp)?.toDate?.() || new Date(),
      })).filter((g: AlgorithmGenre) => g.id > 0 && g.name.length > 0)
      tags = (data.tags || []).map((t: Record<string, unknown>) => ({
        name: (t.name as string) || "",
        rank: (t.rank as number) || 1,
        lastInteractedAt: (t.lastInteractedAt as Timestamp)?.toDate?.() || new Date(),
      })).filter((t: AlgorithmTag) => t.name.length > 0)
    }

    const existingIndex = items.findIndex(
      (item) => item.id === input.id && item.mediaType === input.mediaType
    )

    const watchDuration = input.watchDurationPercent ?? 50
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
        image: input.image || existingItem.image,
        backdropPath: input.backdropPath || existingItem.backdropPath,
        tags: [...new Set([...existingItem.tags, ...input.tags])].slice(0, 10),
      }
    } else {
      items.forEach((item) => {
        if (item.rank > 0) {
          item.rank = Math.max(1, item.rank - 1)
        }
      })

      const newItem: AlgorithmItem = {
        id: input.id,
        mediaType: input.mediaType,
        image: input.image,
        backdropPath: input.backdropPath,
        country: input.country,
        title: input.title,
        tags: input.tags.slice(0, 10),
        genreIds: input.genreIds,
        genres: input.genres,
        rank: maxRank,
        interactionCount: 1,
        watchDurationPercent: watchDuration,
        voteAverage: input.voteAverage,
        popularity: input.popularity,
        originalLanguage: input.originalLanguage,
        releaseDate: input.releaseDate,
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
    const inputGenreIds = new Set(input.genres.map((g) => g.id))

    genres.forEach((g) => {
      if (!inputGenreIds.has(g.id) && g.rank > 0) {
        g.rank = Math.max(1, g.rank - 1)
      }
    })

    for (const genre of input.genres) {
      const existingGenreIndex = genres.findIndex((g) => g.id === genre.id)
      if (existingGenreIndex !== -1) {
        genres[existingGenreIndex].rank = maxGenreRank
        genres[existingGenreIndex].lastInteractedAt = new Date()
      } else {
        genres.push({
          id: genre.id,
          name: genre.name,
          rank: maxGenreRank,
          lastInteractedAt: new Date(),
        })
      }
    }
    
    genres.sort((a, b) => {
      if (b.rank !== a.rank) return b.rank - a.rank
      return b.lastInteractedAt.getTime() - a.lastInteractedAt.getTime()
    })
    
    if (genres.length > MAX_ALGORITHM_GENRES) {
      genres = genres.slice(0, MAX_ALGORITHM_GENRES)
    }

    const inputTagCounts = getTagsFromItem(input)
    const inputTagNames = new Set(inputTagCounts.keys())
    const maxTagRank = MAX_ALGORITHM_TAGS
    
    tags.forEach((t) => {
      if (!inputTagNames.has(t.name.toLowerCase()) && t.rank > 0) {
        t.rank = Math.max(1, t.rank - 1)
      }
    })
    
    for (const [tagName, frequency] of inputTagCounts) {
      const existingTagIndex = tags.findIndex((t) => t.name.toLowerCase() === tagName)
      const frequencyBonus = Math.min(frequency - 1, 3)
      
      if (existingTagIndex !== -1) {
        tags[existingTagIndex] = {
          ...tags[existingTagIndex],
          rank: maxTagRank + frequencyBonus,
          lastInteractedAt: new Date(),
        }
      } else {
        tags.push({
          name: tagName,
          rank: maxTagRank + frequencyBonus,
          lastInteractedAt: new Date(),
        })
      }
    }
    
    tags.sort((a, b) => {
      if (b.rank !== a.rank) return b.rank - a.rank
      return b.lastInteractedAt.getTime() - a.lastInteractedAt.getTime()
    })
    
    if (tags.length > MAX_ALGORITHM_TAGS) {
      tags = tags.slice(0, MAX_ALGORITHM_TAGS)
    }

    const algorithmData = {
      userId: input.userId,
      items: items.map((item) => ({
        ...item,
        lastWatchedAt: item.lastWatchedAt,
        lastInteractedAt: item.lastInteractedAt,
      })),
      genres: genres.map((g) => ({
        ...g,
        lastInteractedAt: g.lastInteractedAt,
      })),
      tags: tags.map((t) => ({
        ...t,
        lastInteractedAt: t.lastInteractedAt,
      })),
      updatedAt: serverTimestamp(),
      ...(existingDoc.exists() ? {} : { createdAt: serverTimestamp() }),
    }

    await setDoc(algorithmRef, algorithmData, { merge: true })

    return {
      userId: input.userId,
      items,
      genres,
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error adding/updating algorithm:", error)
    return null
  }
}

export function getWeightedRandomItems<T extends { rank: number; lastInteractedAt: Date }>(
  items: T[],
  count: number,
  diversityFactor: number = 0.3
): T[] {
  if (items.length <= count) return items

  const weightedItems = items.map((item, index) => {
    const recencyScore = calculateRecencyScore(item.lastInteractedAt)
    const normalizedRank = Math.min(item.rank, 20) / 20
    
    const randomFactor = Math.random() * diversityFactor
    const positionPenalty = index * 0.05
    
    const weight = 
      (normalizedRank * 0.5) + 
      (recencyScore * 0.3) + 
      randomFactor - 
      positionPenalty

    return { item, weight }
  })

  weightedItems.sort((a, b) => b.weight - a.weight)

  return weightedItems.slice(0, count).map((w) => w.item)
}

export function ensureGenreDiversity<T extends { genreIds?: number[]; genres?: { id: number }[] }>(
  items: T[],
  maxPerGenre: number = 2
): T[] {
  const genreCounts = new Map<number, number>()
  const result: T[] = []

  for (const item of items) {
    const itemGenres = item.genreIds || item.genres?.map(g => g.id) || []
    
    const canInclude = itemGenres.every(genreId => {
      const count = genreCounts.get(genreId) || 0
      return count < maxPerGenre
    })

    if (canInclude || result.length < 3) {
      result.push(item)
      for (const genreId of itemGenres) {
        genreCounts.set(genreId, (genreCounts.get(genreId) || 0) + 1)
      }
    }
  }

  return result
}

export async function getUserAlgorithm(
  userId: string
): Promise<UserAlgorithm | null> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firestore is not configured")
    return null
  }

  try {
    const algorithmRef = doc(db, FIREBASE_COLLECTIONS.ALGORITHM, userId)
    const algorithmDoc = await getDoc(algorithmRef)

    if (!algorithmDoc.exists()) {
      return null
    }

    const data = algorithmDoc.data()
    return {
      userId: data.userId,
      items: (data.items || []).map((item: Record<string, unknown>) => ({
        ...item,
        interactionCount: (item.interactionCount as number) || 1,
        watchDurationPercent: (item.watchDurationPercent as number) || 50,
        lastWatchedAt: (item.lastWatchedAt as Timestamp)?.toDate?.() || 
                       (item.lastInteractedAt as Timestamp)?.toDate?.() || 
                       new Date(),
        lastInteractedAt: (item.lastInteractedAt as Timestamp)?.toDate?.() || new Date(),
      })),
      genres: (data.genres || []).map((g: Record<string, unknown>) => ({
        ...g,
        lastInteractedAt: (g.lastInteractedAt as Timestamp)?.toDate?.() || new Date(),
      })),
      tags: (data.tags || []).map((t: Record<string, unknown>) => ({
        ...t,
        lastInteractedAt: (t.lastInteractedAt as Timestamp)?.toDate?.() || new Date(),
      })),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    }
  } catch (error) {
    console.error("Error fetching user algorithm:", error)
    return null
  }
}
