import {SiteHeader} from "@/components/site-header"
import {HeroCarousel} from "@/components/hero-carousel"
import {MediaSection} from "@/components/media-section"
import {
    getTrendingTVShows,
    getTopRatedTVShows,
    getPopularTVShows,
    getOnTheAirTVShows,
} from "@/lib/tmdb"
import type {Metadata} from "next"
import {SITE_NAME} from "@/lib/constants";

export const metadata: Metadata = {
    title: `TV Shows - ${SITE_NAME}`,
    description: `Explore the latest TV series, trending shows, and top-rated television content`,
    keywords: ["tv shows", "series", "television", "tv series", "top rated shows", "popular shows"],
    openGraph: {
        title: `TV Shows - ${SITE_NAME}`,
        description: `Explore the latest TV series, trending shows, and top-rated television content.`,
        url: "https://beatwig.vercel.app/tv",
        siteName: SITE_NAME,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: `TV Shows - ${SITE_NAME}`,
        description: `Explore the latest TV series, trending shows, and top-rated television content.`,
    },
}

export default async function TVShowsPage() {
    try {
        const [
            trendingTVShowsData,
            popularTVShowsData,
            topRatedTVShowsData,
            onTheAirTVShowsData,
        ] = await Promise.all([
            getTrendingTVShows("week").catch(() => ({results: []})),
            getPopularTVShows().catch(() => ({results: []})),
            getTopRatedTVShows().catch(() => ({results: []})),
            getOnTheAirTVShows().catch(() => ({results: []})),
        ])

        const trendingTVShows = trendingTVShowsData?.results || []
        const popularTVShows = popularTVShowsData?.results || []
        const topRatedTVShows = topRatedTVShowsData?.results || []
        const onTheAirTVShows = onTheAirTVShowsData?.results || []

        // Use on-air TV shows for the hero carousel instead of popular shows
        const heroTVShows = onTheAirTVShows
            .filter((show) => show.backdrop_path && show.overview && show.vote_average >= 6.0)
            .slice(0, 5)

        return (
            <>
                <SiteHeader/>

                {heroTVShows.length > 0 && <HeroCarousel items={heroTVShows}/>}

                <div className="pb-16 pt-8">
                    {onTheAirTVShows.length > 0 && (
                        <MediaSection 
                            title="Currently On Air" 
                            viewAllHref="/tv/on-the-air"
                            items={onTheAirTVShows.slice(0, 12)}
                        />
                    )}
                    
                    {popularTVShows.length > 0 && (
                        <MediaSection 
                            title="Popular TV Shows" 
                            viewAllHref="/tv/popular"
                            items={popularTVShows.slice(0, 12)}
                        />
                    )}

                    {trendingTVShows.length > 0 && (
                        <MediaSection
                            title="Trending TV Shows"
                            viewAllHref="/tv/trending"
                            items={trendingTVShows.slice(0, 12)}
                        />
                    )}

                    {topRatedTVShows.length > 0 && (
                        <MediaSection
                            title="Top Rated TV Shows"
                            viewAllHref="/tv/top-rated"
                            items={topRatedTVShows.slice(0, 12)}
                        />
                    )}
                </div>
            </>
        )
    } catch (error) {
        console.error("Error in TVShowsPage component:", error)

        return (
            <>
                <SiteHeader/>
                <div className="container py-20 text-center">
                    <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
                    <p className="text-muted-foreground">
                        We're having trouble loading the TV show information. Please try again later.
                    </p>
                </div>
            </>
        )
    }
}
