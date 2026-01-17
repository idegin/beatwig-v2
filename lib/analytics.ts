"use client"

import { Analytics, getAnalytics, isSupported, logEvent, setUserProperties } from "firebase/analytics"
import { app, isFirebaseConfigured } from "./firebase"

let analytics: Analytics | null = null
let analyticsInitialized = false

async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (analyticsInitialized) return analytics

  if (!isFirebaseConfigured || !app) {
    analyticsInitialized = true
    return null
  }

  try {
    const supported = await isSupported()
    if (supported) {
      analytics = getAnalytics(app)
    }
  } catch (error) {
    console.warn("[Analytics] Failed to initialize:", error)
  }

  analyticsInitialized = true
  return analytics
}

type ContentType = "movie" | "tv"

interface ContentParams {
  contentId: number
  contentType: ContentType
  title: string
  genres?: string[]
}

interface VideoParams extends ContentParams {
  duration?: number
  season?: number
  episode?: number
}

interface SearchParams {
  searchTerm: string
  resultsCount: number
}

interface WatchlistParams extends ContentParams {
  action: "add" | "remove"
}

async function trackEvent(eventName: string, params?: Record<string, unknown>) {
  const analyticsInstance = await getAnalyticsInstance()
  if (!analyticsInstance) return

  try {
    logEvent(analyticsInstance, eventName, params)
  } catch (error) {
    console.warn(`[Analytics] Failed to log ${eventName}:`, error)
  }
}

export const analytics$ = {
  async screenView(screenName: string, screenClass?: string) {
    await trackEvent("screen_view", {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    })
  },

  async selectContent({ contentId, contentType, title, genres }: ContentParams) {
    await trackEvent("select_content", {
      content_type: contentType,
      item_id: String(contentId),
      item_name: title,
      genres: genres?.join(","),
    })
  },

  async search({ searchTerm, resultsCount }: SearchParams) {
    await trackEvent("search", {
      search_term: searchTerm,
      results_count: resultsCount,
    })
  },

  async watchlistAction({ contentId, contentType, title, genres, action }: WatchlistParams) {
    const eventName = action === "add" ? "add_to_watchlist" : "remove_from_watchlist"
    await trackEvent(eventName, {
      content_type: contentType,
      item_id: String(contentId),
      item_name: title,
      genres: genres?.join(","),
    })
  },

  async videoStart({ contentId, contentType, title, genres, duration, season, episode }: VideoParams) {
    await trackEvent("video_start", {
      content_type: contentType,
      item_id: String(contentId),
      item_name: title,
      genres: genres?.join(","),
      duration,
      ...(contentType === "tv" && { season, episode }),
    })
  },

  async videoProgress(
    { contentId, contentType, title, season, episode }: VideoParams,
    progressPercent: number,
    progressSeconds: number
  ) {
    await trackEvent("video_progress", {
      content_type: contentType,
      item_id: String(contentId),
      item_name: title,
      progress_percent: Math.round(progressPercent),
      progress_seconds: Math.round(progressSeconds),
      ...(contentType === "tv" && { season, episode }),
    })
  },

  async videoComplete({ contentId, contentType, title, duration, season, episode }: VideoParams) {
    await trackEvent("video_complete", {
      content_type: contentType,
      item_id: String(contentId),
      item_name: title,
      duration,
      ...(contentType === "tv" && { season, episode }),
    })
  },

  async login(method: string = "google") {
    await trackEvent("login", { method })
  },

  async signUp(method: string = "google") {
    await trackEvent("sign_up", { method })
  },

  async viewGenre(genreId: number, genreName: string) {
    await trackEvent("view_genre", {
      genre_id: String(genreId),
      genre_name: genreName,
    })
  },

  async viewPerson(personId: number, personName: string) {
    await trackEvent("view_person", {
      person_id: String(personId),
      person_name: personName,
    })
  },

  async setUserPreferences(preferences: {
    preferredGenres?: string[]
    watchFrequency?: "low" | "medium" | "high"
  }) {
    const analyticsInstance = await getAnalyticsInstance()
    if (!analyticsInstance) return

    try {
      setUserProperties(analyticsInstance, {
        preferred_genres: preferences.preferredGenres?.slice(0, 5).join(","),
        watch_frequency: preferences.watchFrequency,
      })
    } catch (error) {
      console.warn("[Analytics] Failed to set user properties:", error)
    }
  },

  async exception(description: string, fatal: boolean = false) {
    await trackEvent("exception", {
      description,
      fatal,
    })
  },
}

export type { ContentParams, VideoParams, SearchParams, WatchlistParams }
