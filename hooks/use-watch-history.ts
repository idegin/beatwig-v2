"use client"

import { useCallback, useRef, useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import {
  WATCH_HISTORY_THRESHOLD_SECONDS,
  PROGRESS_UPDATE_INTERVAL_SECONDS,
  ALGORITHM_UPDATE_INTERVAL_SECONDS,
} from "@/app/constants"

interface WatchHistoryData {
  filmId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  releaseDate: string
  runtime: number | null
  season?: number
  episode?: number
  episodeTitle?: string
  genreIds?: number[]
  genres?: { id: number; name: string }[]
  originalLanguage?: string
  popularity?: number
  country?: string
  tags?: string[]
}

interface UseWatchHistoryOptions {
  filmData: WatchHistoryData
  iframeRef?: React.RefObject<HTMLIFrameElement | null>
}

export function useWatchHistory({ filmData, iframeRef }: UseWatchHistoryOptions) {
  const { authState } = useAuth()
  const user = authState.user
  const [isTracking, setIsTracking] = useState(false)
  const [hasAddedToHistory, setHasAddedToHistory] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [progressSeconds, setProgressSeconds] = useState(0)

  const watchTimeRef = useRef(0)
  const lastUpdateRef = useRef(0)
  const lastAlgorithmUpdateRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const thresholdCheckRef = useRef<NodeJS.Timeout | null>(null)

  const updateWatchHistory = useCallback(
    async (progress: number, seconds: number) => {
      if (!user) return

      try {
        const response = await fetch("/api/auth/watch-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...filmData,
            progress,
            progressSeconds: seconds,
          }),
        })

        if (!response.ok) {
          console.error("Failed to update watch history")
        }
      } catch (error) {
        console.error("Error updating watch history:", error)
      }
    },
    [user, filmData]
  )

  const updateAlgorithm = useCallback(async (watchProgress?: number) => {
    if (!user) return

    const progress = watchProgress ?? currentProgress

    try {
      const response = await fetch("/api/auth/algorithm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: filmData.filmId,
          mediaType: filmData.mediaType,
          image: filmData.posterPath || "",
          backdropPath: filmData.backdropPath,
          country: filmData.country || "",
          title: filmData.title,
          tags: filmData.tags || [],
          genreIds: filmData.genreIds || [],
          genres: filmData.genres || [],
          voteAverage: filmData.voteAverage,
          popularity: filmData.popularity || 0,
          originalLanguage: filmData.originalLanguage || "",
          releaseDate: filmData.releaseDate,
          watchDurationPercent: progress,
        }),
      })

      if (!response.ok) {
        console.error("Failed to update algorithm")
      }
    } catch (error) {
      console.error("Error updating algorithm:", error)
    }
  }, [user, filmData, currentProgress])

  const startTracking = useCallback(() => {
    if (isTracking || !user) return
    setIsTracking(true)

    thresholdCheckRef.current = setTimeout(() => {
      if (!hasAddedToHistory) {
        setHasAddedToHistory(true)
        updateWatchHistory(currentProgress, progressSeconds)
        updateAlgorithm(currentProgress)
        lastAlgorithmUpdateRef.current = watchTimeRef.current
      }
    }, WATCH_HISTORY_THRESHOLD_SECONDS * 1000)

    intervalRef.current = setInterval(() => {
      watchTimeRef.current += 1

      const estimatedProgress = calculateEstimatedProgress(
        watchTimeRef.current,
        filmData.runtime
      )
      setCurrentProgress(estimatedProgress)
      setProgressSeconds(watchTimeRef.current)

      if (
        hasAddedToHistory &&
        watchTimeRef.current - lastUpdateRef.current >= PROGRESS_UPDATE_INTERVAL_SECONDS
      ) {
        lastUpdateRef.current = watchTimeRef.current
        updateWatchHistory(estimatedProgress, watchTimeRef.current)
      }

      if (
        hasAddedToHistory &&
        watchTimeRef.current - lastAlgorithmUpdateRef.current >= ALGORITHM_UPDATE_INTERVAL_SECONDS
      ) {
        lastAlgorithmUpdateRef.current = watchTimeRef.current
        updateAlgorithm(estimatedProgress)
      }
    }, 1000)
  }, [
    isTracking,
    user,
    hasAddedToHistory,
    currentProgress,
    progressSeconds,
    filmData.runtime,
    updateWatchHistory,
    updateAlgorithm,
  ])

  const stopTracking = useCallback(() => {
    setIsTracking(false)

    if (thresholdCheckRef.current) {
      clearTimeout(thresholdCheckRef.current)
      thresholdCheckRef.current = null
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (hasAddedToHistory && watchTimeRef.current > 0) {
      updateWatchHistory(currentProgress, watchTimeRef.current)
    }
  }, [hasAddedToHistory, currentProgress, updateWatchHistory])

  const updateProgress = useCallback(
    (progress: number, seconds: number) => {
      setCurrentProgress(progress)
      setProgressSeconds(seconds)
      watchTimeRef.current = seconds

      if (hasAddedToHistory) {
        if (seconds - lastUpdateRef.current >= PROGRESS_UPDATE_INTERVAL_SECONDS) {
          lastUpdateRef.current = seconds
          updateWatchHistory(progress, seconds)
        }
      }
    },
    [hasAddedToHistory, updateWatchHistory]
  )

  useEffect(() => {
    if (user) {
      startTracking()
    }

    return () => {
      stopTracking()
    }
  }, [user])

  useEffect(() => {
    return () => {
      if (thresholdCheckRef.current) {
        clearTimeout(thresholdCheckRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    watchTimeRef.current = 0
    lastUpdateRef.current = 0
    lastAlgorithmUpdateRef.current = 0
    setHasAddedToHistory(false)
    setCurrentProgress(0)
    setProgressSeconds(0)

    if (thresholdCheckRef.current) {
      clearTimeout(thresholdCheckRef.current)
      thresholdCheckRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (user) {
      setIsTracking(false)
      startTracking()
    }
  }, [filmData.filmId, filmData.season, filmData.episode])

  return {
    isTracking,
    hasAddedToHistory,
    currentProgress,
    progressSeconds,
    updateProgress,
    startTracking,
    stopTracking,
  }
}

function calculateEstimatedProgress(
  watchedSeconds: number,
  runtimeMinutes: number | null
): number {
  if (!runtimeMinutes || runtimeMinutes <= 0) {
    return Math.min(Math.floor((watchedSeconds / 7200) * 100), 100)
  }

  const totalSeconds = runtimeMinutes * 60
  const progress = Math.floor((watchedSeconds / totalSeconds) * 100)
  return Math.min(progress, 100)
}
