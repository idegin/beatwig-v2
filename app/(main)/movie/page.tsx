import {SiteHeader} from "@/components/site-header"
import {HeroCarousel} from "@/components/hero-carousel"
import {MediaSection} from "@/components/media-section"
import {
    getTrendingMovies,
    getTopRatedMovies,
    getNowPlayingMovies,
} from "@/lib/tmdb"
import type {Metadata} from "next"
import {SITE_DESCRIPTION, SITE_NAME} from "@/lib/constants";

export const metadata: Metadata = {
    title: `Movies - ${SITE_NAME}`,
    description: `Explore the latest movies, top-rated films, and movies playing in theaters`,
    keywords: ["movies", "films", "cinema", "new releases", "top rated movies", "popular movies"],
    openGraph: {
        title: `Movies - ${SITE_NAME}`,
        description: `Explore the latest movies, top-rated films, and movies playing in theaters.`,
        url: "https://beatwig.site",
        siteName: SITE_NAME,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: `Movies - ${SITE_NAME}`,
        description: `Explore the latest movies, top-rated films, and movies playing in theaters.`,
    },
}

export default async function MoviesPage() {
    try {
        // Fetch data in parallel with error handling
        const [
            trendingMoviesData,
            nowPlayingMoviesData,
            topRatedMoviesData,
        ] = await Promise.all([
            getTrendingMovies("day").catch(() => ({results: []})),
            getNowPlayingMovies().catch(() => ({results: []})),
            getTopRatedMovies().catch(() => ({results: []})),
        ])

        // Ensure all results arrays exist
        const trendingMovies = trendingMoviesData?.results || []
        const nowPlayingMovies = nowPlayingMoviesData?.results || []
        const topRatedMovies = topRatedMoviesData?.results || []

        // Get top 5 movies in theaters with good backdrops for the hero carousel
        const heroMovies = nowPlayingMovies
            .filter((movie) => movie.backdrop_path && movie.overview && movie.vote_average >= 6.0)
            .slice(0, 5)

        return (
            <>
                <SiteHeader/>

                {heroMovies.length > 0 && <HeroCarousel items={heroMovies}/>}

                <div className="pb-16 pt-8">
                    {trendingMovies.length > 0 && (
                        <MediaSection 
                            title="Trending Movies" 
                            viewAllHref="/movies/trending"
                            items={trendingMovies.slice(0, 12)}
                        />
                    )}

                    {nowPlayingMovies.length > 0 && (
                        <MediaSection
                            title="Now Playing in Theaters"
                            viewAllHref="/movies/now-playing"
                            items={nowPlayingMovies.slice(0, 12)}
                        />
                    )}

                    {topRatedMovies.length > 0 && (
                        <MediaSection
                            title="Top Rated Movies"
                            viewAllHref="/movies/top-rated"
                            items={topRatedMovies.slice(0, 12)}
                        />
                    )}
                </div>
            </>
        )
    } catch (error) {
        console.error("Error in MoviesPage component:", error)

        // Fallback UI in case of error
        return (
            <>
                <SiteHeader/>
                <div className="container py-20 text-center">
                    <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
                    <p className="text-muted-foreground">
                        We're having trouble loading the movie information. Please try again later.
                    </p>
                </div>
            </>
        )
    }
}
