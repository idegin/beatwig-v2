import { Suspense } from "react"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { GenreHero } from "@/components/genre-hero"
import { GenreContent } from "@/components/genre-content"
import { GenreDetailsSkeleton } from "@/components/genre-details-skeleton"
import type { Metadata } from "next"
import { getGenreDetails, getMoviesByGenre, getTVShowsByGenre } from "@/lib/tmdb"

interface GenrePageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params, searchParams }: GenrePageProps): Promise<Metadata> {
    try {
        const { id } = await params
        const resolvedSearchParams = await searchParams
        const genreId = Number.parseInt(id)
        const mediaType = (resolvedSearchParams.type === "tv" ? "tv" : "movie") as "movie" | "tv"
        const genre = await getGenreDetails(genreId, mediaType)

        return {
            title: `${genre.name} ${mediaType === "tv" ? "TV Shows" : "Movies"} | BeatWig`,
            description: `Explore ${genre.name} ${mediaType === "tv" ? "TV shows" : "movies"} on BeatWig. Find the best ${genre.name} content to watch.`,
        }
    } catch (error) {
        return {
            title: "Genre Not Found | BeatWig",
            description: "The genre you're looking for could not be found.",
        }
    }
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
    try {
        const { id } = await params
        const resolvedSearchParams = await searchParams
        const genreId = Number.parseInt(id)
        const mediaType = (resolvedSearchParams.type === "tv" ? "tv" : "movie") as "movie" | "tv"
        const page = Number.parseInt((resolvedSearchParams.page as string) || "1")
        const sortBy = (resolvedSearchParams.sort_by as string) || "popularity.desc"

        const [genre, mediaItems] = await Promise.all([
            getGenreDetails(genreId, mediaType),
            mediaType === "tv" 
                ? getTVShowsByGenre(genreId, page, sortBy) 
                : getMoviesByGenre(genreId, page, sortBy),
        ])

        return (
            <>
                <SiteHeader />
                <Suspense fallback={<GenreDetailsSkeleton />}>
                    <GenreHero genre={genre} mediaType={mediaType} />
                    <GenreContent 
                        genre={genre} 
                        mediaType={mediaType} 
                        mediaItems={mediaItems} 
                        currentPage={page}
                        currentSortBy={sortBy} 
                    />
                </Suspense>
            </>
        )
    } catch (error) {
        console.error("Error in Genre page:", error)
        notFound()
    }
}
