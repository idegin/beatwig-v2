import { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { getKeywordDetails, getMoviesByKeyword, getTVShowsByKeyword } from "@/lib/tmdb"
import { KeywordHero } from "@/components/keyword-hero"
import { KeywordContent } from "@/components/keyword-content"
import { SITE_NAME } from "@/lib/constants"

interface KeywordPageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: KeywordPageProps): Promise<Metadata> {
    try {
        const { id: keywordId } = await params
        const keyword = await getKeywordDetails(keywordId)

        return {
            title: `${keyword.name} - Movies & TV Shows | ${SITE_NAME}`,
            description: `Explore movies and TV shows tagged with "${keyword.name}". Discover content related to this theme and find your next watch.`,
            keywords: [keyword.name, "movies", "tv shows", "keyword", "tags"],
            openGraph: {
                title: `${keyword.name} - Movies & TV Shows | ${SITE_NAME}`,
                description: `Explore movies and TV shows tagged with "${keyword.name}".`,
                url: `https://beatwig.site/keyword/${keywordId}`,
                siteName: SITE_NAME,
                type: "website",
            },
            twitter: {
                card: "summary",
                title: `${keyword.name} - Movies & TV Shows | ${SITE_NAME}`,
                description: `Explore movies and TV shows tagged with "${keyword.name}".`,
            },
        }
    } catch (error) {
        return {
            title: "Keyword Not Found | BeatWig",
            description: "The keyword you're looking for could not be found.",
        }
    }
}

export default async function KeywordPage({ params, searchParams }: KeywordPageProps) {
    try {
        const { id: keywordId } = await params
        const resolvedSearchParams = await searchParams
        const mediaType = (resolvedSearchParams.type === "tv" ? "tv" : "movie") as "movie" | "tv"

        const [keyword, initialMovies, initialTVShows] = await Promise.all([
            getKeywordDetails(keywordId),
            getMoviesByKeyword(keywordId, 1).catch(() => ({ results: [], total_pages: 0, page: 1, total_results: 0 })),
            getTVShowsByKeyword(keywordId, 1).catch(() => ({ results: [], total_pages: 0, page: 1, total_results: 0 })),
        ])

        return (
            <>
                <SiteHeader />
                <KeywordHero keyword={keyword} />
                <KeywordContent 
                    keyword={keyword}
                    initialMovies={initialMovies}
                    initialTVShows={initialTVShows}
                    defaultType={mediaType}
                />
            </>
        )
    } catch (error) {
        console.error("Error in Keyword page:", error)
        notFound()
    }
}
