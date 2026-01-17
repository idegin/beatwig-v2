"use client"

import * as React from "react"
import { PageSection } from "@/components/page-section"
import { ContinueWatching } from "@/components/home/continue-watching"
import { GenreRow } from "@/components/home/genre-row"
import { FilmRow } from "@/components/film-row"
import { ContinueWatchingItem, WatchHistoryItem } from "@/types/firebase.types"
import { Film, Genre } from "@/types/tmdb.types"
import { useAuth } from "@/context/auth-context"
import { TMDB_IMAGE_BASE } from "@/app/constants"
import { Skeleton } from "@/components/ui/skeleton"

interface ForYouContentProps {
  genres: Genre[]
  continueWatch: ContinueWatchingItem[]
  algorithmRecommendations?: {
    title: string
    films: Film[]
    mediaType?: "movie" | "tv"
  }[]
  topGenres?: {
    id: number
    name: string
    rank: number
  }[]
  topTags?: {
    name: string
    rank: number
  }[]
  lowerRankTags?: {
    name: string
    rank: number
  }[]
  nowPlaying?: Film[]
  trending?: Film[]
  upcoming?: Film[]
  popularTV?: Film[]
  hasUserData?: boolean
  recentlyWatchedTitles?: {
    id: number
    mediaType: "movie" | "tv"
    title: string
  }[]
  popularThemes?: {
    name: string
    films: Film[]
  }[]
  popularGenreFilms?: {
    genreName: string
    films: Film[]
  }[]
  whatOthersWatching?: Film[]
}

function formatRuntime(minutes: number | null): string {
  if (!minutes) return ""
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

function watchHistoryToContinueWatching(item: WatchHistoryItem): ContinueWatchingItem {
  const year = item.releaseDate ? new Date(item.releaseDate).getFullYear() : 0
  const rating = item.voteAverage ? item.voteAverage.toFixed(1) : "N/A"
  const imageUrl = item.backdropPath
    ? `${TMDB_IMAGE_BASE}/w780${item.backdropPath}`
    : item.posterPath
      ? `${TMDB_IMAGE_BASE}/w500${item.posterPath}`
      : "/placeholder.jpg"

  return {
    id: String(item.filmId),
    title: item.title,
    type: item.mediaType,
    image: imageUrl,
    progress: item.progress,
    duration: formatRuntime(item.runtime),
    episode: item.episode,
    season: item.season,
    year,
    rating,
  }
}

function shuffleArray<T>(array: T[], seed?: number): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getStableKey<T extends { id?: number; name?: string }>(items: T[]): string {
  return items.map(item => `${item.id ?? ''}-${item.name ?? ''}`).join(',')
}

function ensureFilmDiversity(films: Film[], maxPerGenre: number = 3): Film[] {
  const genreCounts = new Map<number, number>()
  const result: Film[] = []
  
  for (const film of films) {
    const filmGenres = film.genre_ids || []
    const canInclude = filmGenres.every(genreId => {
      const count = genreCounts.get(genreId) || 0
      return count < maxPerGenre
    })
    
    if (canInclude || result.length < 4) {
      result.push(film)
      for (const genreId of filmGenres) {
        genreCounts.set(genreId, (genreCounts.get(genreId) || 0) + 1)
      }
    }
    
    if (result.length >= 12) break
  }
  
  return result
}

export function ForYouContent({
  genres,
  continueWatch,
  algorithmRecommendations = [],
  topGenres = [],
  topTags = [],
  lowerRankTags = [],
  nowPlaying = [],
  trending = [],
  upcoming = [],
  popularTV = [],
  hasUserData = false,
  recentlyWatchedTitles = [],
  popularThemes = [],
  popularGenreFilms = [],
  whatOthersWatching = [],
}: ForYouContentProps) {
  const { isAuthenticated } = useAuth()
  const [watchHistory, setWatchHistory] = React.useState<ContinueWatchingItem[]>(continueWatch)
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false)
  const [genreFilms, setGenreFilms] = React.useState<{ genreName: string; films: Film[] }[]>([])
  const [tagFilms, setTagFilms] = React.useState<{ keyword: string; films: Film[] }[]>([])
  const [lowerTagFilms, setLowerTagFilms] = React.useState<{ keyword: string; films: Film[] }[]>([])
  const [isLoadingGenres, setIsLoadingGenres] = React.useState(false)
  const [isLoadingTags, setIsLoadingTags] = React.useState(false)
  const [isLoadingLowerTags, setIsLoadingLowerTags] = React.useState(false)
  const [shuffledTrending, setShuffledTrending] = React.useState<Film[]>([])
  const [mixedContent, setMixedContent] = React.useState<Film[]>([])

  const hasShuffledRef = React.useRef(false)
  const trendingKey = React.useMemo(() => trending.map(t => t.id).join(','), [trending])
  const upcomingKey = React.useMemo(() => upcoming.map(u => u.id).join(','), [upcoming])
  const popularTVKey = React.useMemo(() => popularTV.map(p => p.id).join(','), [popularTV])

  React.useEffect(() => {
    if (hasShuffledRef.current) return
    if (trending.length > 0) {
      hasShuffledRef.current = true
      setShuffledTrending(shuffleArray(trending).slice(0, 12))
    }
    
    if (upcoming.length > 0 && popularTV.length > 0) {
      const mixed = shuffleArray([
        ...upcoming.slice(0, 6),
        ...popularTV.slice(0, 6)
      ])
      setMixedContent(ensureFilmDiversity(mixed))
    }
  }, [trending, upcoming, popularTV, trendingKey, upcomingKey, popularTVKey])

  const continueWatchLength = continueWatch.length
  const hasFetchedHistoryRef = React.useRef(false)

  React.useEffect(() => {
    async function fetchWatchHistory() {
      if (!isAuthenticated || continueWatchLength > 0 || hasFetchedHistoryRef.current) {
        return
      }

      hasFetchedHistoryRef.current = true
      setIsLoadingHistory(true)
      try {
        const response = await fetch("/api/auth/watch-history?continue=true&limit=10")
        if (response.ok) {
          const data = await response.json()
          const items = (data.items || []).map(watchHistoryToContinueWatching)
          setWatchHistory(items)
        }
      } catch (error) {
        console.error("Error fetching watch history:", error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    fetchWatchHistory()
  }, [isAuthenticated, continueWatchLength])

  const topGenresKey = React.useMemo(() => getStableKey(topGenres), [topGenres])
  const hasFetchedGenresRef = React.useRef(false)
  const lastGenresKeyRef = React.useRef('')

  React.useEffect(() => {
    async function fetchGenreFilms() {
      if (topGenres.length === 0 || (hasFetchedGenresRef.current && lastGenresKeyRef.current === topGenresKey)) return

      hasFetchedGenresRef.current = true
      lastGenresKeyRef.current = topGenresKey
      setIsLoadingGenres(true)
      try {
        const results: { genreName: string; films: Film[] }[] = []
        for (const genre of topGenres) {
          const response = await fetch(`/api/public/genre-films?genreId=${genre.id}&mediaType=movie&limit=12`)
          if (response.ok) {
            const data = await response.json()
            if (data.films && data.films.length > 0) {
              results.push({
                genreName: genre.name,
                films: data.films,
              })
            }
          }
        }
        setGenreFilms(results)
      } catch (error) {
        console.error("Error fetching genre films:", error)
      } finally {
        setIsLoadingGenres(false)
      }
    }

    fetchGenreFilms()
  }, [topGenres, topGenresKey])

  const topTagsKey = React.useMemo(() => topTags.map(t => t.name).join(','), [topTags])
  const hasFetchedTagsRef = React.useRef(false)
  const lastTagsKeyRef = React.useRef('')

  React.useEffect(() => {
    async function fetchTagFilms() {
      if (topTags.length === 0 || (hasFetchedTagsRef.current && lastTagsKeyRef.current === topTagsKey)) return

      hasFetchedTagsRef.current = true
      lastTagsKeyRef.current = topTagsKey
      setIsLoadingTags(true)
      try {
        const results: { keyword: string; films: Film[] }[] = []
        for (const tag of topTags) {
          const response = await fetch(`/api/public/keyword-films?keyword=${encodeURIComponent(tag.name)}&limit=12`)
          if (response.ok) {
            const data = await response.json()
            if (data.films && data.films.length > 0) {
              results.push({
                keyword: tag.name,
                films: data.films,
              })
            }
          }
        }
        setTagFilms(results)
      } catch (error) {
        console.error("Error fetching tag films:", error)
      } finally {
        setIsLoadingTags(false)
      }
    }

    fetchTagFilms()
  }, [topTags, topTagsKey])

  const lowerTagsKey = React.useMemo(() => lowerRankTags.map(t => t.name).join(','), [lowerRankTags])
  const hasFetchedLowerTagsRef = React.useRef(false)
  const lastLowerTagsKeyRef = React.useRef('')

  React.useEffect(() => {
    async function fetchLowerTagFilms() {
      if (lowerRankTags.length === 0 || (hasFetchedLowerTagsRef.current && lastLowerTagsKeyRef.current === lowerTagsKey)) return

      hasFetchedLowerTagsRef.current = true
      lastLowerTagsKeyRef.current = lowerTagsKey
      setIsLoadingLowerTags(true)
      try {
        const results: { keyword: string; films: Film[] }[] = []
        for (const tag of lowerRankTags.slice(0, 5)) {
          const response = await fetch(`/api/public/keyword-films?keyword=${encodeURIComponent(tag.name)}&limit=12`)
          if (response.ok) {
            const data = await response.json()
            if (data.films && data.films.length > 0) {
              results.push({
                keyword: tag.name,
                films: data.films,
              })
            }
          }
        }
        setLowerTagFilms(results)
      } catch (error) {
        console.error("Error fetching lower tag films:", error)
      } finally {
        setIsLoadingLowerTags(false)
      }
    }

    fetchLowerTagFilms()
  }, [lowerRankTags, lowerTagsKey])

  const diverseRecommendations = React.useMemo(() => {
    const shuffled = shuffleArray(algorithmRecommendations)
    return shuffled.slice(0, 3).map(rec => ({
      ...rec,
      films: ensureFilmDiversity(shuffleArray(rec.films))
    }))
  }, [algorithmRecommendations])

  const shuffledGenreFilms = React.useMemo(() => {
    return genreFilms.map(section => ({
      ...section,
      films: shuffleArray(section.films).slice(0, 12)
    }))
  }, [genreFilms])

  const shuffledTagFilms = React.useMemo(() => {
    return tagFilms.map(section => ({
      ...section,
      films: shuffleArray(section.films).slice(0, 12)
    }))
  }, [tagFilms])

  const shuffledNowPlaying = React.useMemo(() => {
    return shuffleArray(nowPlaying).slice(0, 12)
  }, [nowPlaying])

  const shuffledLowerTagFilms = React.useMemo(() => {
    return lowerTagFilms.map(section => ({
      ...section,
      films: shuffleArray(section.films).slice(0, 12)
    }))
  }, [lowerTagFilms])

  const shuffledWhatOthersWatching = React.useMemo(() => {
    return shuffleArray(whatOthersWatching).slice(0, 12)
  }, [whatOthersWatching])

  const shuffledPopularThemes = React.useMemo(() => {
    return popularThemes.map(section => ({
      ...section,
      films: shuffleArray(section.films).slice(0, 12)
    }))
  }, [popularThemes])

  const shuffledPopularGenreFilms = React.useMemo(() => {
    return popularGenreFilms.map(section => ({
      ...section,
      films: shuffleArray(section.films).slice(0, 12)
    }))
  }, [popularGenreFilms])

  return (
    <div className="space-y-2 md:space-y-4">
      {(watchHistory.length > 0 || isLoadingHistory) && (
        <PageSection
          heading="Continue Watching"
          subHeading="Pick up where you left off"
          altLink={{ route: "/history", text: "View History" }}
        >
          {isLoadingHistory ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-75 h-44 rounded-lg shrink-0" />
              ))}
            </div>
          ) : (
            <ContinueWatching items={watchHistory} />
          )}
        </PageSection>
      )}

      {diverseRecommendations.length > 0 && diverseRecommendations[0]?.films.length > 0 && (
        <PageSection
          heading={`Because You Watched "${diverseRecommendations[0].title}"`}
          subHeading={`More ${diverseRecommendations[0].mediaType === "tv" ? "shows" : "movies"} you might enjoy`}
        >
          <FilmRow films={diverseRecommendations[0].films} />
        </PageSection>
      )}

      {shuffledNowPlaying.length > 0 && (
        <PageSection
          heading="Now Showing in Theaters"
          subHeading="Currently playing in cinemas"
          altLink={{ route: "/movies", text: "All Movies" }}
        >
          <FilmRow films={shuffledNowPlaying} />
        </PageSection>
      )}

      {shuffledTrending.length > 0 && (
        <PageSection
          heading="Trending This Week"
          subHeading="What everyone's watching right now"
        >
          <FilmRow films={shuffledTrending} />
        </PageSection>
      )}

      {diverseRecommendations.length > 1 && diverseRecommendations[1]?.films.length > 0 && (
        <PageSection
          heading={`Because You Watched "${diverseRecommendations[1].title}"`}
          subHeading={`More ${diverseRecommendations[1].mediaType === "tv" ? "shows" : "movies"} you might enjoy`}
        >
          <FilmRow films={diverseRecommendations[1].films} />
        </PageSection>
      )}

      {hasUserData && shuffledTagFilms.length > 0 && (
        <PageSection
          heading="Themes You Love"
          subHeading="Content matching your favorite themes"
        >
          {isLoadingTags ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="w-50 h-75 rounded-lg shrink-0" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {shuffledTagFilms.slice(0, 3).map((section, index) => (
                <div key={`tag-section-${section.keyword}-${index}`}>
                  <h4 className="text-lg font-medium mb-3 text-muted-foreground capitalize">
                    {section.keyword}
                  </h4>
                  <FilmRow films={section.films} />
                </div>
              ))}
            </div>
          )}
        </PageSection>
      )}

      {mixedContent.length > 0 && (
        <PageSection
          heading="Coming Soon & Popular Shows"
          subHeading="Discover what's next and what's hot"
        >
          <FilmRow films={mixedContent} />
        </PageSection>
      )}

      {diverseRecommendations.length > 2 && diverseRecommendations[2]?.films.length > 0 && (
        <PageSection
          heading={`Because You Watched "${diverseRecommendations[2].title}"`}
          subHeading={`More ${diverseRecommendations[2].mediaType === "tv" ? "shows" : "movies"} you might enjoy`}
        >
          <FilmRow films={diverseRecommendations[2].films} />
        </PageSection>
      )}

      {hasUserData && shuffledGenreFilms.length > 0 && (
        <PageSection
          heading="Your Favorite Genres"
          subHeading="Based on your watching patterns"
        >
          {isLoadingGenres ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="w-50 h-75 rounded-lg shrink-0" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {shuffledGenreFilms.slice(0, 3).map((section, index) => (
                <div key={`genre-section-${section.genreName}-${index}`}>
                  <h4 className="text-lg font-medium mb-3 text-muted-foreground">
                    {section.genreName}
                  </h4>
                  <FilmRow films={section.films} />
                </div>
              ))}
            </div>
          )}
        </PageSection>
      )}

      {hasUserData && shuffledLowerTagFilms.length > 0 && (
        <PageSection
          heading="More Themes For You"
          subHeading="Explore beyond your favorites"
        >
          {isLoadingLowerTags ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="w-50 h-75 rounded-lg shrink-0" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {shuffledLowerTagFilms.slice(0, 5).map((section, index) => (
                <div key={`lower-tag-section-${section.keyword}-${index}`}>
                  <h4 className="text-lg font-medium mb-3 text-muted-foreground capitalize">
                    {section.keyword}
                  </h4>
                  <FilmRow films={section.films} />
                </div>
              ))}
            </div>
          )}
        </PageSection>
      )}

      {!hasUserData && shuffledWhatOthersWatching.length > 0 && (
        <PageSection
          heading="What Others Are Watching"
          subHeading="Popular picks from our community"
        >
          <FilmRow films={shuffledWhatOthersWatching} />
        </PageSection>
      )}

      {!hasUserData && shuffledPopularThemes.length > 0 && (
        <PageSection
          heading="Popular Themes"
          subHeading="Trending topics and keywords"
        >
          <div className="space-y-6">
            {shuffledPopularThemes.slice(0, 3).map((section, index) => (
              <div key={`popular-theme-${section.name}-${index}`}>
                <h4 className="text-lg font-medium mb-3 text-muted-foreground capitalize">
                  {section.name}
                </h4>
                <FilmRow films={section.films} />
              </div>
            ))}
          </div>
        </PageSection>
      )}

      {!hasUserData && shuffledPopularGenreFilms.length > 0 && (
        <PageSection
          heading="Popular Genres"
          subHeading="Explore what's trending by genre"
        >
          <div className="space-y-6">
            {shuffledPopularGenreFilms.slice(0, 3).map((section, index) => (
              <div key={`popular-genre-${section.genreName}-${index}`}>
                <h4 className="text-lg font-medium mb-3 text-muted-foreground">
                  {section.genreName}
                </h4>
                <FilmRow films={section.films} />
              </div>
            ))}
          </div>
        </PageSection>
      )}

      <PageSection
        heading="Browse by Genre"
        subHeading="Find something that matches your mood"
        altLink={{ route: "/genres", text: "All Genres" }}
      >
        <GenreRow genres={genres} />
      </PageSection>
    </div>
  )
}
