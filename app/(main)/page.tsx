import { SiteHeader } from "@/components/site-header"
import { HeroCarousel } from "@/components/hero-carousel"
import { MediaSection } from "@/components/media-section"
import { GenreSection } from "@/components/genre-section"
import {
  getTrendingMovies,
  getTrendingTVShows,
  getTrendingPeople,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  getNowPlayingMovies,
  getMovieGenres,
  getTVGenres,
} from "@/lib/tmdb"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BeatWig - Advanced Movie Website",
  description:
    "Discover the latest movies and TV shows. Watch trailers, find ratings, and get recommendations for what to watch next.",
  keywords: ["movies", "tv shows", "trailers", "watch online", "film database", "movie ratings", "tv series"],
  openGraph: {
    title: "BeatWig - Advanced Movie Website",
    description:
      "Discover the latest movies and TV shows. Watch trailers, find ratings, and get recommendations for what to watch next.",
    url: "https://beatwig.vercel.app",
    siteName: "BeatWig",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BeatWig - Advanced Movie Website",
    description:
      "Discover the latest movies and TV shows. Watch trailers, find ratings, and get recommendations for what to watch next.",
  },
}

export default async function Home() {
  try {
    // Fetch data in parallel with error handling
    const [
      trendingMoviesData,
      trendingTVShowsData,
      trendingPeopleData,
      popularMoviesData,
      popularTVShowsData,
      topRatedMoviesData,
      topRatedTVShowsData,
      nowPlayingMoviesData,
      movieGenresData,
      tvGenresData,
    ] = await Promise.all([
      getTrendingMovies("day").catch(() => ({ results: [] })),
      getTrendingTVShows("day").catch(() => ({ results: [] })),
      getTrendingPeople("week").catch(() => ({ results: [] })),
      getPopularMovies().catch(() => ({ results: [] })),
      getPopularTVShows().catch(() => ({ results: [] })),
      getTopRatedMovies().catch(() => ({ results: [] })),
      getTopRatedTVShows().catch(() => ({ results: [] })),
      getNowPlayingMovies().catch(() => ({ results: [] })),
      getMovieGenres().catch(() => ({ genres: [] })),
      getTVGenres().catch(() => ({ genres: [] })),
    ])

    // Ensure all results arrays exist
    const trendingMovies = trendingMoviesData?.results || []
    const trendingTVShows = trendingTVShowsData?.results || []
    const trendingPeople = trendingPeopleData?.results || []
    const popularMovies = popularMoviesData?.results || []
    const popularTVShows = popularTVShowsData?.results || []
    const topRatedMovies = topRatedMoviesData?.results || []
    const topRatedTVShows = topRatedTVShowsData?.results || []
    const nowPlayingMovies = nowPlayingMoviesData?.results || []
    const movieGenres = movieGenresData?.genres || []
    const tvGenres = tvGenresData?.genres || []

    // Get top 5 trending movies with good backdrops for the hero carousel
    const heroMovies = trendingMovies
      .filter((movie) => movie.backdrop_path && movie.overview && movie.vote_average >= 6.5)
      .slice(0, 5)

    return (
      <>
        <SiteHeader />

        {heroMovies.length > 0 && <HeroCarousel items={heroMovies} />}

        <div className="pb-16 pt-8">
          {trendingMovies.length > 0 && (
            <MediaSection title="Trending Movies" viewAllHref="/movies/trending" items={trendingMovies.slice(0, 12)} />
          )}

          {trendingTVShows.length > 0 && (
            <MediaSection title="Trending TV Shows" viewAllHref="/tv/trending" items={trendingTVShows.slice(0, 12)} />
          )}

          {nowPlayingMovies.length > 0 && (
            <MediaSection
              title="Now Playing in Theaters"
              viewAllHref="/movies/now-playing"
              items={nowPlayingMovies.slice(0, 12)}
            />
          )}

          {popularTVShows.length > 0 && (
            <MediaSection title="Popular TV Shows" viewAllHref="/tv/popular" items={popularTVShows.slice(0, 12)} />
          )}

          {topRatedMovies.length > 0 && (
            <MediaSection
              title="Top Rated Movies"
              viewAllHref="/movies/top-rated"
              items={topRatedMovies.slice(0, 12)}
            />
          )}

          {topRatedTVShows.length > 0 && (
            <MediaSection title="Top Rated TV Shows" viewAllHref="/tv/top-rated" items={topRatedTVShows.slice(0, 12)} />
          )}

          {trendingPeople.length > 0 && (
            <MediaSection title="Popular People" viewAllHref="/person" items={trendingPeople.slice(0, 12)} />
          )}

          {movieGenres.length > 0 && <GenreSection title="Movie Genres" genres={movieGenres} type="movie" />}

          {tvGenres.length > 0 && <GenreSection title="TV Genres" genres={tvGenres} type="tv" />}
        </div>
      </>
    )
  } catch (error) {
    console.error("Error in Home component:", error)

    // Fallback UI in case of error
    return (
      <>
        <SiteHeader />
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground">
            We're having trouble loading the latest movies and TV shows. Please try again later.
          </p>
        </div>
      </>
    )
  }
}

