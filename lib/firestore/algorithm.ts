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
  TV_EPISODE_RANK_MULTIPLIER,
  TV_BASE_RANK_CAP,
  MOVIE_BASE_RANK,
  ALGORITHM_RECENCY_DECAY_DAYS,
  ALGORITHM_RECENCY_WEIGHT,
  ALGORITHM_RANK_WEIGHT,
  TAG_FREQUENCY_BOOST,
  TAG_RECENCY_WEIGHT,
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
        ...g,
        lastInteractedAt: (g.lastInteractedAt as Timestamp)?.toDate?.() || new Date(),
      }))
      tags = (data.tags || []).map((t: Record<string, unknown>) => ({
        ...t,
        lastInteractedAt: (t.lastInteractedAt as Timestamp)?.toDate?.() || new Date(),
      }))
    }

    const existingIndex = items.findIndex(
      (item) => item.id === input.id && item.mediaType === input.mediaType
    )

    const watchDuration = input.watchDurationPercent ?? 50

    if (existingIndex !== -1) {
      const existingItem = items[existingIndex]
      const newInteractionCount = existingItem.interactionCount + 1
      const rankIncrement = calculateRankIncrement(
        input.mediaType, 
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
        image: input.image || existingItem.image,
        backdropPath: input.backdropPath || existingItem.backdropPath,
        tags: [...new Set([...existingItem.tags, ...input.tags])].slice(0, 10),
      }
    } else {
      const rankIncrement = calculateRankIncrement(input.mediaType, 1, watchDuration)
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
        rank: rankIncrement,
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

    items.sort((a, b) => calculateEffectiveRank(b) - calculateEffectiveRank(a))
    
    if (items.length > MAX_ALGORITHM_ITEMS) {
      items = items.slice(0, MAX_ALGORITHM_ITEMS)
    }

    for (const genre of input.genres) {
      const existingGenreIndex = genres.findIndex((g) => g.id === genre.id)
      if (existingGenreIndex !== -1) {
        const existingGenre = genres[existingGenreIndex]
        const recencyScore = calculateRecencyScore(existingGenre.lastInteractedAt)
        genres[existingGenreIndex].rank = existingGenre.rank + (1 * (0.5 + recencyScore * 0.5))
        genres[existingGenreIndex].lastInteractedAt = new Date()
      } else {
        genres.push({
          id: genre.id,
          name: genre.name,
          rank: 1,
          lastInteractedAt: new Date(),
        })
      }
    }
    
    genres.sort((a, b) => {
      const aScore = a.rank * calculateRecencyScore(a.lastInteractedAt)
      const bScore = b.rank * calculateRecencyScore(b.lastInteractedAt)
      return bScore - aScore
    })
    
    if (genres.length > MAX_ALGORITHM_GENRES) {
      genres = genres.slice(0, MAX_ALGORITHM_GENRES)
    }

    const inputTagCounts = getTagsFromItem(input)
    
    for (const [tagName, frequency] of inputTagCounts) {
      const existingTagIndex = tags.findIndex((t) => t.name.toLowerCase() === tagName)
      
      if (existingTagIndex !== -1) {
        const existingTag = tags[existingTagIndex]
        tags[existingTagIndex] = {
          ...existingTag,
          rank: calculateTagRank(existingTag.rank, existingTag.lastInteractedAt, frequency),
          lastInteractedAt: new Date(),
        }
      } else {
        tags.push({
          name: tagName,
          rank: 1 + (frequency * TAG_FREQUENCY_BOOST),
          lastInteractedAt: new Date(),
        })
      }
    }
    
    tags.sort((a, b) => {
      const aScore = a.rank * calculateRecencyScore(a.lastInteractedAt)
      const bScore = b.rank * calculateRecencyScore(b.lastInteractedAt)
      return bScore - aScore
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
