"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MovieCard } from "@/components/movie-card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getMoviesByKeyword, getTVShowsByKeyword, KeywordResponse, MovieResponse, TVResponse } from "@/lib/tmdb"
import { Film, Tv } from "lucide-react"

interface KeywordContentProps {
    keyword: KeywordResponse
    initialMovies: MovieResponse
    initialTVShows: TVResponse
    defaultType: "movie" | "tv"
}

export function KeywordContent({ keyword, initialMovies, initialTVShows, defaultType }: KeywordContentProps) {
    const [activeTab, setActiveTab] = useState<"movie" | "tv">(defaultType)
    const [movies, setMovies] = useState(initialMovies.results)
    const [tvShows, setTVShows] = useState(initialTVShows.results)
    const [moviesPage, setMoviesPage] = useState(1)
    const [tvShowsPage, setTVShowsPage] = useState(1)
    const [loadingMovies, setLoadingMovies] = useState(false)
    const [loadingTVShows, setLoadingTVShows] = useState(false)
    const [hasMoreMovies, setHasMoreMovies] = useState(initialMovies.page < initialMovies.total_pages)
    const [hasMoreTVShows, setHasMoreTVShows] = useState(initialTVShows.page < initialTVShows.total_pages)

    const observerRef = useRef<IntersectionObserver | null>(null)
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loadingMovies || loadingTVShows) return
        if (observerRef.current) observerRef.current.disconnect()
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                if (activeTab === "movie" && hasMoreMovies) {
                    loadMoreMovies()
                } else if (activeTab === "tv" && hasMoreTVShows) {
                    loadMoreTVShows()
                }
            }
        })
        if (node) observerRef.current.observe(node)
    }, [loadingMovies, loadingTVShows, activeTab, hasMoreMovies, hasMoreTVShows])

    const loadMoreMovies = async () => {
        if (loadingMovies || !hasMoreMovies) return
        
        setLoadingMovies(true)
        try {
            const nextPage = moviesPage + 1
            const response = await getMoviesByKeyword(keyword.id.toString(), nextPage)
            setMovies(prev => [...prev, ...response.results])
            setMoviesPage(nextPage)
            setHasMoreMovies(nextPage < response.total_pages)
        } catch (error) {
            console.error("Error loading more movies:", error)
        } finally {
            setLoadingMovies(false)
        }
    }

    const loadMoreTVShows = async () => {
        if (loadingTVShows || !hasMoreTVShows) return
        
        setLoadingTVShows(true)
        try {
            const nextPage = tvShowsPage + 1
            const response = await getTVShowsByKeyword(keyword.id.toString(), nextPage)
            setTVShows(prev => [...prev, ...response.results])
            setTVShowsPage(nextPage)
            setHasMoreTVShows(nextPage < response.total_pages)
        } catch (error) {
            console.error("Error loading more TV shows:", error)
        } finally {
            setLoadingTVShows(false)
        }
    }

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            ))}        </div>
    )

    return (
        <div className="flex justify-center">
            <div className="container py-8">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "movie" | "tv")} className="w-full">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                        <TabsTrigger value="movie" className="flex items-center gap-2">
                            <Film className="h-4 w-4" />
                            Movies
                            <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary border-primary/20">
                                {initialMovies.total_results}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="tv" className="flex items-center gap-2">
                            <Tv className="h-4 w-4" />
                            TV Shows
                            <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary border-primary/20">
                                {initialTVShows.total_results}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>                    <TabsContent value="movie" className="mt-8">
                        {movies.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                                    <Film className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No movies found</h3>
                                <p className="text-muted-foreground">
                                    No movies are currently tagged with <span className="font-medium text-primary">"{keyword.name}"</span>.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {movies.map((movie, index) => (
                                        <div
                                            key={movie.id}
                                            ref={index === movies.length - 1 ? lastElementRef : null}
                                        >
                                            <MovieCard media={movie} />
                                        </div>
                                    ))}
                                </div>
                                {loadingMovies && (
                                    <div className="mt-8">
                                        <LoadingSkeleton />
                                    </div>
                                )}
                                {!hasMoreMovies && movies.length > 12 && (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground text-sm">
                                            You've reached the end of the results
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="tv" className="mt-8">
                        {tvShows.length === 0 ? (
                            <div className="text-center py-12">
                                <Tv className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No TV shows found</h3>
                                <p className="text-muted-foreground">
                                    No TV shows are currently tagged with "{keyword.name}".
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {tvShows.map((tvShow, index) => (
                                        <div
                                            key={tvShow.id}
                                            ref={index === tvShows.length - 1 ? lastElementRef : null}
                                        >
                                            <MovieCard media={tvShow} />
                                        </div>
                                    ))}
                                </div>
                                {loadingTVShows && (
                                    <div className="mt-8">
                                        <LoadingSkeleton />
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
