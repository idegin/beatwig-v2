import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Movie, TVShow, Person } from "@/lib/tmdb"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a more readable format
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return "Unknown"

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Unknown"
  }
}

/**
 * Format movie runtime from minutes to hours and minutes
 */
export function formatRuntime(minutes: number): string {
  if (!minutes) return "Unknown"

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) return `${remainingMinutes}m`
  if (remainingMinutes === 0) return `${hours}h`

  return `${hours}h ${remainingMinutes}m`
}

/**
 * Get full image URL from TMDB
 */
export function getTMDBImageUrl(path: string | null, size: string): string {
  if (!path) return "/placeholder.svg?height=400&width=300"
  return `https://image.tmdb.org/t/p/${size}${path}`
}

/**
 * Format movie rating to one decimal place
 */
export function formatRating(rating: number): string {
  if (!rating && rating !== 0) return "N/A"
  return (Math.round(rating * 10) / 10).toFixed(1)
}


/**
 * Truncate text to a specific length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Extract year from date string
 */
export function extractYear(dateString?: string): string {
  if (!dateString) return "Unknown"
  try {
    return new Date(dateString).getFullYear().toString()
  } catch (error) {
    console.error("Error extracting year:", error)
    return "Unknown"
  }
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  if (!num && num !== 0) return "0"
  return num.toLocaleString()
}

/**
 * Get title from media item (works for both movies and TV shows)
 */
export function getMediaTitle(media: Movie | TVShow): string {
  if (!media) return "Unknown"
  return "title" in media && media.title ? media.title : media.name || "Unknown"
}

/**
 * Get release date from media item (works for both movies and TV shows)
 */
export function getMediaDate(media: Movie | TVShow): string | undefined {
  if (!media) return undefined
  return "release_date" in media ? media.release_date : media.first_air_date
}

/**
 * Check if media is a movie
 */
export function isMovie(media: Movie | TVShow | Person): media is Movie {
  if (!media) return false
  return "title" in media || media.media_type === "movie"
}

/**
 * Check if media is a TV show
 */
export function isTVShow(media: Movie | TVShow | Person): media is TVShow {
  if (!media) return false
  return ("name" in media && !("known_for_department" in media)) || media.media_type === "tv"
}

/**
 * Check if media is a person
 */
export function isPerson(media: Movie | TVShow | Person): media is Person {
  if (!media) return false
  return "known_for_department" in media || media.media_type === "person"
}

export const getGenreColor = (genreName: string): string => {
  const genreColors: Record<string, string> = {
    Action: "from-red-500/20 to-red-800/20",
    Adventure: "from-amber-500/20 to-amber-800/20",
    Animation: "from-yellow-500/20 to-yellow-800/20",
    Comedy: "from-lime-500/20 to-lime-800/20",
    Crime: "from-blue-500/20 to-blue-800/20",
    Documentary: "from-indigo-500/20 to-indigo-800/20",
    Drama: "from-purple-500/20 to-purple-800/20",
    Family: "from-pink-500/20 to-pink-800/20",
    Fantasy: "from-teal-500/20 to-teal-800/20",
    History: "from-orange-500/20 to-orange-800/20",
    Horror: "from-red-900/20 to-black/40",
    Music: "from-fuchsia-500/20 to-fuchsia-800/20",
    Mystery: "from-violet-500/20 to-violet-800/20",
    Romance: "from-rose-500/20 to-rose-800/20",
    "Science Fiction": "from-cyan-500/20 to-cyan-800/20",
    "TV Movie": "from-emerald-500/20 to-emerald-800/20",
    Thriller: "from-slate-500/20 to-slate-800/20",
    War: "from-stone-500/20 to-stone-800/20",
    Western: "from-amber-700/20 to-amber-900/20",
    // TV genres
    "Action & Adventure": "from-red-500/20 to-amber-800/20",
    Kids: "from-yellow-500/20 to-green-500/20",
    News: "from-blue-500/20 to-blue-700/20",
    Reality: "from-orange-500/20 to-red-500/20",
    "Sci-Fi & Fantasy": "from-purple-500/20 to-blue-500/20",
    Soap: "from-pink-500/20 to-red-300/20",
    Talk: "from-green-500/20 to-green-700/20",
    "War & Politics": "from-red-700/20 to-blue-700/20",
  }

  return genreColors[genreName] || "from-primary/20 to-primary/5"
}
