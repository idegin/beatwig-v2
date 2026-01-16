import { HomeHero } from "@/components/home/home-hero"
import { ForYouContent } from "./components/for-you-content"
import { 
  getForYouPageData, 
  getRecommendationsFromAlgorithm, 
  getRecommendationsByKeyword,
  getNowPlayingMovies,
  getTrendingAll,
  getUpcomingMovies,
  getPopularTVShows,
  getMoviesByGenre,
} from "@/lib/tmdb"
import { getAuthToken } from "@/lib/auth-cookies"
import { verifyAuthToken, getUserAlgorithm, getUserWatchHistory } from "@/lib/server-auth"
import { TMDB_IMAGE_BASE, ALGORITHM_RECENCY_DECAY_DAYS } from "@/app/constants"
import { ContinueWatchingItem } from "@/types/firebase.types"
import { Film } from "@/types/tmdb.types"

const POPULAR_GENRES = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 878, name: "Science Fiction" },
  { id: 10749, name: "Romance" },
]

const POPULAR_KEYWORDS = [
  "superhero",
  "revenge",
  "love",
  "friendship",
  "survival",
]

export const metadata = {
  title: "For You | BeatWig",
  description: "Personalized recommendations based on your watch history",
}

function calculateRecencyScore(date: Date): number {
  const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (daysSince <= 0) return 1
  if (daysSince >= ALGORITHM_RECENCY_DECAY_DAYS) return 0.1
  return Math.max(0.1, 1 - (daysSince / ALGORITHM_RECENCY_DECAY_DAYS) * 0.9)
}

function getWeightedItems<T extends { rank: number; lastInteractedAt: Date }>(
  items: T[],
  count: number,
  diversityFactor: number = 0.3
): T[] {
  if (items.length <= count) return items

  const weightedItems = items.map((item, index) => {
    const recencyScore = calculateRecencyScore(item.lastInteractedAt)
    const normalizedRank = Math.min(item.rank, 20) / 20
    const randomFactor = Math.random() * diversityFactor
    const positionPenalty = index * 0.03
    
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

export default async function ForYouPage() {
  const data = await getForYouPageData()
  
  let algorithmRecommendations: { title: string; films: Film[]; mediaType: "movie" | "tv" }[] = []
  let continueWatchingItems: ContinueWatchingItem[] = []
  let topGenres: { id: number; name: string; rank: number }[] = []
  let topTags: { name: string; rank: number }[] = []
  let lowerRankTags: { name: string; rank: number }[] = []
  let nowPlayingFilms: Film[] = []
  let trendingFilms: Film[] = []
  let upcomingFilms: Film[] = []
  let popularTVFilms: Film[] = []
  let hasUserData = false
  let mixedRecentItems: { id: number; mediaType: "movie" | "tv"; title: string }[] = []
  
  let popularThemes: { name: string; films: Film[] }[] = []
  let popularGenreFilms: { genreName: string; films: Film[] }[] = []
  let whatOthersWatching: Film[] = []

  const [nowPlayingData, trendingData, upcomingData, popularTVData] = await Promise.all([
    getNowPlayingMovies().catch(() => ({ results: [] })),
    getTrendingAll("week").catch(() => ({ results: [] })),
    getUpcomingMovies().catch(() => ({ results: [] })),
    getPopularTVShows().catch(() => ({ results: [] })),
  ])

  nowPlayingFilms = nowPlayingData.results.slice(0, 12).map((f) => ({
    ...f,
    media_type: "movie" as const,
  }))

  trendingFilms = trendingData.results.slice(0, 12).map((f) => ({
    ...f,
    media_type: (f.media_type as "movie" | "tv") || "movie",
  }))

  upcomingFilms = upcomingData.results.slice(0, 12).map((f) => ({
    ...f,
    media_type: "movie" as const,
  }))

  popularTVFilms = popularTVData.results.slice(0, 12).map((f) => ({
    ...f,
    media_type: "tv" as const,
  }))

  try {
    const token = await getAuthToken()
    if (token) {
      const user = await verifyAuthToken(token)
      if (user) {
        const [algorithm, watchHistory] = await Promise.all([
          getUserAlgorithm(user.uid),
          getUserWatchHistory(user.uid, 10, true),
        ])

        if (algorithm && algorithm.items.length > 0) {
          hasUserData = true
          
          const itemsWithRecency = algorithm.items.map(item => ({
            ...item,
            effectiveScore: calculateRecencyScore(item.lastInteractedAt) * item.rank
          }))
          
          const selectedItems = getWeightedItems(
            itemsWithRecency.map(item => ({
              ...item,
              rank: item.effectiveScore
            })),
            Math.min(4, algorithm.items.length),
            0.35
          )
          
          algorithmRecommendations = await getRecommendationsFromAlgorithm(
            selectedItems.map((item) => ({
              id: item.id,
              mediaType: item.mediaType,
              title: item.title,
              genreIds: item.genreIds,
              rank: item.rank,
              lastInteractedAt: item.lastInteractedAt,
              interactionCount: item.interactionCount,
            })),
            3,
            0.35
          )

          if (algorithm.genres && algorithm.genres.length > 0) {
            const weightedGenres = getWeightedItems(algorithm.genres, 5, 0.25)
            topGenres = weightedGenres.map((g) => ({ 
              id: g.id, 
              name: g.name, 
              rank: g.rank 
            }))
          }

          if (algorithm.tags && algorithm.tags.length > 0) {
            const weightedTags = getWeightedItems(algorithm.tags, 5, 0.25)
            topTags = weightedTags.map((t) => ({ 
              name: t.name, 
              rank: t.rank 
            }))
            
            if (algorithm.tags.length > 5) {
              const remainingTags = algorithm.tags
                .filter(t => !topTags.find(top => top.name === t.name))
                .slice(0, 5)
              lowerRankTags = remainingTags.map((t) => ({
                name: t.name,
                rank: t.rank
              }))
            }
          }

          const recentItems = [...algorithm.items]
            .sort((a, b) => b.lastInteractedAt.getTime() - a.lastInteractedAt.getTime())
            .slice(0, 3)
          
          mixedRecentItems = recentItems.map(item => ({
            id: item.id,
            mediaType: item.mediaType,
            title: item.title,
          }))
        }

        if (watchHistory.length > 0) {
          hasUserData = true
          continueWatchingItems = watchHistory.map((item) => ({
            id: String(item.filmId),
            title: item.title,
            type: item.mediaType,
            image: item.backdropPath
              ? `${TMDB_IMAGE_BASE}/w780${item.backdropPath}`
              : item.posterPath
              ? `${TMDB_IMAGE_BASE}/w500${item.posterPath}`
              : "/placeholder.jpg",
            progress: item.progress,
            duration: "",
            episode: item.episode,
            season: item.season,
            year: 0,
            rating: "",
          }))
        }
      }
    }
  } catch (error) {
    console.error("Error fetching personalized data:", error)
  }

  if (!hasUserData) {
    try {
      const [genreFilmsResults, themeFilmsResults] = await Promise.all([
        Promise.all(
          POPULAR_GENRES.slice(0, 3).map(async (genre) => {
            const films = await getMoviesByGenre(genre.id, 1).catch(() => ({ results: [] as Film[], total_pages: 0 }))
            return {
              genreName: genre.name,
              films: films.results.slice(0, 12).map((f: Film) => ({ ...f, media_type: "movie" as const })),
            }
          })
        ),
        Promise.all(
          POPULAR_KEYWORDS.slice(0, 3).map(async (keyword) => {
            const result = await getRecommendationsByKeyword(keyword).catch(() => null)
            return {
              name: keyword,
              films: result?.films || [],
            }
          })
        ),
      ])

      popularGenreFilms = genreFilmsResults.filter(g => g.films.length > 0)
      popularThemes = themeFilmsResults.filter(t => t.films.length > 0)
      whatOthersWatching = trendingFilms.slice(0, 12)
    } catch (error) {
      console.error("Error fetching popular content:", error)
    }
  }

  if (!data.heroData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Failed to load content
      </div>
    )
  }

  return (
    <>
      <HomeHero data={data.heroData} />
      <ForYouContent
        genres={data.genres}
        continueWatch={continueWatchingItems}
        algorithmRecommendations={algorithmRecommendations}
        topGenres={topGenres}
        topTags={topTags}
        lowerRankTags={lowerRankTags}
        nowPlaying={nowPlayingFilms}
        trending={trendingFilms}
        upcoming={upcomingFilms}
        popularTV={popularTVFilms}
        hasUserData={hasUserData}
        recentlyWatchedTitles={mixedRecentItems}
        popularThemes={popularThemes}
        popularGenreFilms={popularGenreFilms}
        whatOthersWatching={whatOthersWatching}
      />
    </>
  )
}
