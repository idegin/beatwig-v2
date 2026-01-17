"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { analytics$ } from "@/lib/analytics"

interface AnalyticsProviderProps {
  children: React.ReactNode
}

const screenNameMap: Record<string, string> = {
  "/": "Home",
  "/movies": "Movies",
  "/tv-shows": "TV Shows",
  "/search": "Search",
  "/watchlist": "Watchlist",
  "/history": "Watch History",
  "/for-you": "For You",
  "/profile": "Profile",
}

function getScreenName(pathname: string): string {
  if (screenNameMap[pathname]) {
    return screenNameMap[pathname]
  }

  if (pathname.startsWith("/film/movie/")) {
    if (pathname.includes("/watch")) return "Movie Player"
    return "Movie Details"
  }

  if (pathname.startsWith("/film/tv/")) {
    if (pathname.includes("/watch")) return "TV Player"
    return "TV Show Details"
  }

  if (pathname.startsWith("/genre/")) return "Genre"
  if (pathname.startsWith("/keyword/")) return "Keyword"
  if (pathname.startsWith("/person/")) return "Person"

  return pathname
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const prevPathname = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (pathname && pathname !== prevPathname.current) {
      const screenName = getScreenName(pathname)
      analytics$.screenView(screenName, pathname)
      prevPathname.current = pathname
    }
  }, [pathname])

  return <>{children}</>
}

export function useTrackScreen(screenName: string) {
  const tracked = React.useRef(false)

  React.useEffect(() => {
    if (!tracked.current) {
      analytics$.screenView(screenName)
      tracked.current = true
    }
  }, [screenName])
}
