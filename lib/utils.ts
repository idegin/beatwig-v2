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
 * Get base URL for client-side use
 */
export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return "https://beatwig.vercel.app"
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

