import { HomeHero } from "@/components/home/home-hero"
import Home from "@/components/home/home"
import { 
  getCachedHomePageData,
  getCachedPopularOnApp,
  getCachedHotThemesThisWeek,
  getCachedCommunityFavorites,
  getCachedAppTrendingFilms,
  getCachedRandomGenresFromAlgorithms,
  getCachedTop10OnApp,
  getCachedMoviesByGenre,
} from "@/lib/cache"
import { getAuthToken } from "@/lib/auth-cookies"
import { 
  verifyAuthToken, 
  getUserAlgorithm,
  TrendingFilmData,
  CommunityFavoriteData,
} from "@/lib/server-auth"
import { Film } from "@/types/tmdb.types"

function trendingToFilm(item: TrendingFilmData): Film {
  return {
    id: item.filmId,
    title: item.title,
    name: item.title,
    poster_path: item.posterPath,
    backdrop_path: item.backdropPath,
    media_type: item.mediaType,
    overview: "",
    vote_average: 0,
    vote_count: 0,
    popularity: item.watchCount,
    genre_ids: [],
    release_date: "",
    first_air_date: "",
    adult: false,
    original_language: "",
  }
}

function communityToFilm(item: CommunityFavoriteData): Film {
  return {
    id: item.filmId,
    title: item.title,
    name: item.title,
    poster_path: item.posterPath,
    backdrop_path: item.backdropPath,
    media_type: item.mediaType,
    overview: "",
    vote_average: item.voteAverage,
    vote_count: 0,
    popularity: item.saveCount,
    genre_ids: [],
    release_date: "",
    first_air_date: "",
    adult: false,
    original_language: "",
  }
}

export default async function Page() {
  const [
    data,
    popularOnAppData,
    hotThemesData,
    communityFavoritesData,
    trendingOnAppData,
    randomGenresData,
    top10Data,
  ] = await Promise.all([
    getCachedHomePageData(),
    getCachedPopularOnApp(12).catch(() => []),
    getCachedHotThemesThisWeek(10).catch(() => []),
    getCachedCommunityFavorites(12).catch(() => []),
    getCachedAppTrendingFilms(48, 12).catch(() => []),
    getCachedRandomGenresFromAlgorithms(3).catch(() => []),
    getCachedTop10OnApp().catch(() => []),
  ])

  let showRecommendationBanner = false

  try {
    const token = await getAuthToken()
    if (token) {
      const user = await verifyAuthToken(token)
      if (user) {
        const algorithm = await getUserAlgorithm(user.uid)
        showRecommendationBanner = !algorithm || algorithm.items.length === 0
      }
    }
  } catch {
    showRecommendationBanner = false
  }

  const randomGenreSections = await Promise.all(
    randomGenresData.map(async (genre) => {
      const films = await getCachedMoviesByGenre(genre.id, 1).catch(() => ({ results: [] as Film[], total_pages: 0 }))
      return {
        id: genre.id,
        name: genre.name,
        films: films.results.slice(0, 12).map((f: Film) => ({ ...f, media_type: "movie" as const })),
      }
    })
  )

  const popularOnBeatWig = popularOnAppData.map(trendingToFilm)
  const communityFavorites = communityFavoritesData.map(communityToFilm)
  const whatPeopleWatching = trendingOnAppData.map(trendingToFilm)
  const hotThemes = hotThemesData.map(t => ({ name: t.name, userCount: t.userCount }))
  const top10OnApp = top10Data.map(trendingToFilm)

  if (!data.heroData) {
    return <div className="min-h-screen flex items-center justify-center">Failed to load content</div>
  }

  return (
    <>
      <HomeHero data={data.heroData} />
      <Home
        nowShowingInTheaters={data.nowShowingInTheaters}
        upcomingMovies={data.upcomingMovies}
        genres={data.genres}
        popularPeople={data.popularPeople}
        showRecommendationBanner={showRecommendationBanner}
        popularOnBeatWig={popularOnBeatWig}
        hotThemes={hotThemes}
        communityFavorites={communityFavorites}
        whatPeopleWatching={whatPeopleWatching}
        top10OnApp={top10OnApp}
        randomGenreSections={randomGenreSections}
      />
    </>
  )
}
