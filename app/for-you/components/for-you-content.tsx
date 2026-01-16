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

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
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

  React.useEffect(() => {
    setShuffledTrending(shuffleArray(trending).slice(0, 12))
    
    if (upcoming.length > 0 && popularTV.length > 0) {
      const mixed = shuffleArray([
        ...upcoming.slice(0, 6),
        ...popularTV.slice(0, 6)
      ])
      setMixedContent(ensureFilmDiversity(mixed))
    }
  }, [trending, upcoming, popularTV])

  React.useEffect(() => {
    async function fetchWatchHistory() {
      if (!isAuthenticated || continueWatch.length > 0) {
        return
      }

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
  }, [isAuthenticated, continueWatch.length])

  React.useEffect(() => {
    async function fetchGenreFilms() {
      if (topGenres.length === 0) return

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
  }, [topGenres])

  React.useEffect(() => {
    async function fetchTagFilms() {
      if (topTags.length === 0) return

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
  }, [topTags])

  React.useEffect(() => {
    async function fetchLowerTagFilms() {
      if (lowerRankTags.length === 0) return

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
  }, [lowerRankTags])

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

      {nowPlaying.length > 0 && (
        <PageSection
          heading="Now Showing in Theaters"
          subHeading="Currently playing in cinemas"
          altLink={{ route: "/movies", text: "All Movies" }}
        >
          <FilmRow films={shuffleArray(nowPlaying).slice(0, 12)} />
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

      {hasUserData && lowerTagFilms.length > 0 && (
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
              {lowerTagFilms.slice(0, 5).map((section, index) => (
                <div key={`lower-tag-section-${section.keyword}-${index}`}>
                  <h4 className="text-lg font-medium mb-3 text-muted-foreground capitalize">
                    {section.keyword}
                  </h4>
                  <FilmRow films={shuffleArray(section.films).slice(0, 12)} />
                </div>
              ))}
            </div>
          )}
        </PageSection>
      )}

      {!hasUserData && whatOthersWatching.length > 0 && (
        <PageSection
          heading="What Others Are Watching"
          subHeading="Popular picks from our community"
        >
          <FilmRow films={shuffleArray(whatOthersWatching).slice(0, 12)} />
        </PageSection>
      )}

      {!hasUserData && popularThemes.length > 0 && (
        <PageSection
          heading="Popular Themes"
          subHeading="Trending topics and keywords"
        >
          <div className="space-y-6">
            {popularThemes.slice(0, 3).map((section, index) => (
              <div key={`popular-theme-${section.name}-${index}`}>
                <h4 className="text-lg font-medium mb-3 text-muted-foreground capitalize">
                  {section.name}
                </h4>
                <FilmRow films={shuffleArray(section.films).slice(0, 12)} />
              </div>
            ))}
          </div>
        </PageSection>
      )}

      {!hasUserData && popularGenreFilms.length > 0 && (
        <PageSection
          heading="Popular Genres"
          subHeading="Explore what's trending by genre"
        >
          <div className="space-y-6">
            {popularGenreFilms.slice(0, 3).map((section, index) => (
              <div key={`popular-genre-${section.genreName}-${index}`}>
                <h4 className="text-lg font-medium mb-3 text-muted-foreground">
                  {section.genreName}
                </h4>
                <FilmRow films={shuffleArray(section.films).slice(0, 12)} />
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
