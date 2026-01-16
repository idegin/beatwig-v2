import { unstable_cache } from "next/cache"
import { 
  getHomePageData as fetchHomePageData, 
  getForYouPageData as fetchForYouPageData,
  getMoviesByGenre as fetchMoviesByGenre,
  getNowPlayingMovies as fetchNowPlayingMovies,
  getTrendingAll as fetchTrendingAll,
  getUpcomingMovies as fetchUpcomingMovies,
  getPopularTVShows as fetchPopularTVShows,
  getRecommendationsByKeyword as fetchRecommendationsByKeyword,
} from "@/lib/tmdb"
import {
  getPopularOnApp as fetchPopularOnApp,
  getHotThemesThisWeek as fetchHotThemesThisWeek,
  getCommunityFavorites as fetchCommunityFavorites,
  getAppTrendingFilms as fetchAppTrendingFilms,
  getRandomGenresFromAlgorithms as fetchRandomGenresFromAlgorithms,
  getTop10OnApp as fetchTop10OnApp,
} from "@/lib/server-auth"

const TWENTY_FOUR_HOURS = 60 * 60 * 24

export const getCachedHomePageData = unstable_cache(
  async () => {
    return fetchHomePageData()
  },
  ["home-page-data"],
  {
    tags: ["home-page", "tmdb-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)

export const getCachedForYouPageData = unstable_cache(
  async () => {
    return fetchForYouPageData()
  },
  ["for-you-page-data"],
  {
    tags: ["for-you-page", "tmdb-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)

export const getCachedPopularOnApp = unstable_cache(
  async (limit: number) => {
    return fetchPopularOnApp(limit)
  },
  ["popular-on-app"],
  {
    tags: ["popular-on-app", "firebase-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)

export const getCachedHotThemesThisWeek = unstable_cache(
  async (limit: number) => {
    return fetchHotThemesThisWeek(limit)
  },
  ["hot-themes-this-week"],
  {
    tags: ["hot-themes", "firebase-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)

export const getCachedCommunityFavorites = unstable_cache(
  async (limit: number) => {
    return fetchCommunityFavorites(limit)
  },
  ["community-favorites"],
  {
    tags: ["community-favorites", "firebase-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)

export const getCachedAppTrendingFilms = unstable_cache(
  async (hours: number, limit: number) => {
    return fetchAppTrendingFilms(hours, limit)
  },
  ["app-trending-films"],
  {
    tags: ["trending-films", "firebase-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)

export const getCachedRandomGenresFromAlgorithms = unstable_cache(
  async (count: number) => {
    return fetchRandomGenresFromAlgorithms(count)
  },
  ["random-genres-from-algorithms"],
  {
    tags: ["random-genres", "firebase-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)

export const getCachedTop10OnApp = unstable_cache(
  async () => {
    return fetchTop10OnApp()
  },
  ["top-10-on-app"],
  {
    tags: ["top-10", "firebase-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)

export const getCachedMoviesByGenre = unstable_cache(
  async (genreId: number, page: number = 1) => {
    return fetchMoviesByGenre(genreId, page)
  },
  ["movies-by-genre"],
  {
    tags: ["movies-by-genre", "tmdb-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)

export const getCachedNowPlayingMovies = unstable_cache(
  async () => {
    return fetchNowPlayingMovies()
  },
  ["now-playing-movies"],
  {
    tags: ["now-playing", "tmdb-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)

export const getCachedTrendingAll = unstable_cache(
  async (timeWindow: "day" | "week" = "week") => {
    return fetchTrendingAll(timeWindow)
  },
  ["trending-all"],
  {
    tags: ["trending", "tmdb-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)

export const getCachedUpcomingMovies = unstable_cache(
  async () => {
    return fetchUpcomingMovies()
  },
  ["upcoming-movies"],
  {
    tags: ["upcoming", "tmdb-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)

export const getCachedPopularTVShows = unstable_cache(
  async () => {
    return fetchPopularTVShows()
  },
  ["popular-tv-shows"],
  {
    tags: ["popular-tv", "tmdb-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)

export const getCachedRecommendationsByKeyword = unstable_cache(
  async (keyword: string) => {
    return fetchRecommendationsByKeyword(keyword)
  },
  ["recommendations-by-keyword"],
  {
    tags: ["keyword-recommendations", "tmdb-data"],
    revalidate: TWENTY_FOUR_HOURS,
  }
)
