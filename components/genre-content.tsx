"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useRouter } from 'next13-progressbar'
import { MovieCard } from "@/components/movie-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { Genre, Movie, TVShow, GenreMovieResult, GenreTVResult } from "@/lib/tmdb"
import { getMoviesByGenre, getTVShowsByGenre } from "@/lib/tmdb"

interface GenreContentProps {
    genre: Genre
    mediaType: "movie" | "tv"
    mediaItems: GenreMovieResult | GenreTVResult
    currentPage: number
    currentSortBy: string
}

export function GenreContent({ genre, mediaType, mediaItems, currentPage, currentSortBy }: GenreContentProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const loaderRef = useRef<HTMLDivElement>(null)

    const [sortBy, setSortBy] = useState<string>(currentSortBy)
    const [items, setItems] = useState<Movie[] | TVShow[]>(mediaItems.results)
    const [page, setPage] = useState<number>(currentPage)
    const [loading, setLoading] = useState<boolean>(false)
    const [hasMore, setHasMore] = useState<boolean>(page < mediaItems.total_pages)
    const [isChangingSort, setIsChangingSort] = useState<boolean>(false)

    useEffect(() => {
        setItems(mediaItems.results)
        setPage(currentPage)
        setHasMore(currentPage < mediaItems.total_pages)
        setSortBy(currentSortBy)
    }, [mediaItems, currentPage, currentSortBy, mediaType])

    const loadMoreItems = async () => {
        if (loading || !hasMore || isChangingSort) return
        
        try {
            setLoading(true)
            const nextPage = page + 1
            const genreId = genre.id
            
            const newData = mediaType === "tv"
                //@ts-ignore
                ? await getTVShowsByGenre(genreId, nextPage, sortBy)
                //@ts-ignore
                : await getMoviesByGenre(genreId, nextPage, sortBy)
            
            if (newData.results.length > 0) {
                //@ts-ignore
                setItems(prev => [...prev, ...newData.results])
                setPage(nextPage)
                setHasMore(nextPage < newData.total_pages)
                
                const params = new URLSearchParams(searchParams.toString())
                params.set("page", nextPage.toString())
                router.replace(`${pathname}?${params.toString()}`, { scroll: false })
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error("Error loading more items:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSortChange = (value: string) => {
        if (value === sortBy) return
        
        // Update state first to disable infinite scroll while changing sort
        setIsChangingSort(true)
        setSortBy(value)
        
        // Update URL params which will trigger a new server component render
        const params = new URLSearchParams(searchParams.toString())
        params.set("sort_by", value)
        params.set("page", "1") // Reset to page 1
        router.push(`${pathname}?${params.toString()}`)
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading && !isChangingSort) {
                    loadMoreItems()
                }
            },
            { threshold: 1.0 }
        )

        if (loaderRef.current) {
            observer.observe(loaderRef.current)
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current)
            }
        }
    }, [hasMore, loading, isChangingSort])

    return (
        <div className="flex justify-center">
            <div className="container py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <p className="text-muted-foreground">
                            Showing {items.length} of {mediaItems.total_results.toLocaleString()} results
                        </p>
                    </div>

                    <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Sort by"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="popularity.desc">Popularity (Desc)</SelectItem>
                            <SelectItem value="popularity.asc">Popularity (Asc)</SelectItem>
                            <SelectItem value="vote_average.desc">Rating (Desc)</SelectItem>
                            <SelectItem value="vote_average.asc">Rating (Asc)</SelectItem>
                            <SelectItem value="release_date.desc">Release Date (Desc)</SelectItem>
                            <SelectItem value="release_date.asc">Release Date (Asc)</SelectItem>
                            <SelectItem value="first_air_date.desc">Air Date (Desc)</SelectItem>
                            <SelectItem value="first_air_date.asc">Air Date (Asc)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-semibold mb-2">No results found</h2>
                        <p className="text-muted-foreground mb-6">
                            We couldn't find any {mediaType === "tv" ? "TV shows" : "movies"} in the {genre.name} genre.
                        </p>
                        <Button asChild>
                            <a href="/">Browse All</a>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {items.map((item) => (
                                <MovieCard key={`${item.id}-${item.vote_average}-${item.media_type}`} media={item as Movie}/>
                            ))}
                        </div>

                        <div 
                            ref={loaderRef} 
                            className="flex justify-center items-center py-8 mt-4"
                        >
                            {loading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                            {!hasMore && items.length > 0 && (
                                <p className="text-muted-foreground text-sm">
                                    No more content to load
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
