"use client"

import { useState, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MovieCard } from "@/components/movie-card"
import { PersonDetails, PersonCredits, PersonTVCredits } from "@/lib/tmdb"
import { Film, Tv, User, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface PersonContentProps {
    person: PersonDetails
    movieCredits: PersonCredits
    tvCredits: PersonTVCredits
}

export function PersonContent({ person, movieCredits, tvCredits }: PersonContentProps) {
    const [activeTab, setActiveTab] = useState("filmography")
    const [visibleMovieCredits, setVisibleMovieCredits] = useState(12)
    const [visibleTVCredits, setVisibleTVCredits] = useState(12)
    
    // Combine and sort all credits by date
    const allMovieCredits = [
        ...movieCredits.cast.map(credit => ({ ...credit, role: credit.character, type: 'cast' as const })),
        ...movieCredits.crew.map(credit => ({ ...credit, role: credit.job, type: 'crew' as const }))
    ].sort((a, b) => {
        const dateA = new Date(a.release_date || '1900-01-01').getTime()
        const dateB = new Date(b.release_date || '1900-01-01').getTime()
        return dateB - dateA // Most recent first
    })

    const allTVCredits = [
        ...tvCredits.cast.map(credit => ({ ...credit, role: credit.character, type: 'cast' as const })),
        ...tvCredits.crew.map(credit => ({ ...credit, role: credit.job, type: 'crew' as const }))
    ].sort((a, b) => {        const dateA = new Date(a.first_air_date || '1900-01-01').getTime()
        const dateB = new Date(b.first_air_date || '1900-01-01').getTime()
        return dateB - dateA // Most recent first
    })

    // Infinite scroll observers
    const movieObserverRef = useRef<IntersectionObserver | null>(null)
    const tvObserverRef = useRef<IntersectionObserver | null>(null)
    
    const lastMovieElementRef = useCallback((node: HTMLDivElement) => {
        if (movieObserverRef.current) movieObserverRef.current.disconnect()
        movieObserverRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && visibleMovieCredits < allMovieCredits.length) {
                setVisibleMovieCredits(prev => Math.min(prev + 12, allMovieCredits.length))
            }
        })
        if (node) movieObserverRef.current.observe(node)
    }, [visibleMovieCredits, allMovieCredits.length])

    const lastTVElementRef = useCallback((node: HTMLDivElement) => {
        if (tvObserverRef.current) tvObserverRef.current.disconnect()
        tvObserverRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && visibleTVCredits < allTVCredits.length) {
                setVisibleTVCredits(prev => Math.min(prev + 12, allTVCredits.length))
            }
        })
        if (node) tvObserverRef.current.observe(node)
    }, [visibleTVCredits, allTVCredits.length])

    return (
        <div className="flex justify-center">
            <div className="container py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
                        <TabsTrigger value="filmography" className="flex items-center gap-2">
                            <Film className="h-4 w-4" />
                            Movies
                            <Badge variant="secondary" className="ml-1">
                                {allMovieCredits.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="tv" className="flex items-center gap-2">
                            <Tv className="h-4 w-4" />
                            TV Shows
                            <Badge variant="secondary" className="ml-1">
                                {allTVCredits.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="about" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            About
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="filmography" className="mt-8">
                        {allMovieCredits.length === 0 ? (
                            <div className="text-center py-12">
                                <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No movie credits found</h3>
                                <p className="text-muted-foreground">
                                    This person doesn't have any movie credits in our database.
                                </p>
                            </div>                        ) : (
                            <div className="space-y-8">
                                {/* Movies Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {allMovieCredits.slice(0, visibleMovieCredits).map((credit, index) => (
                                        <div 
                                            key={`${credit.id}-${credit.credit_id}`} 
                                            className="space-y-2"
                                            ref={index === visibleMovieCredits - 1 ? lastMovieElementRef : null}
                                        >
                                            <MovieCard media={credit} />
                                            
                                        </div>
                                    ))}
                                </div>
                                {visibleMovieCredits < allMovieCredits.length && (
                                    <div className="text-center py-4">
                                        <p className="text-muted-foreground text-sm">
                                            Showing {visibleMovieCredits} of {allMovieCredits.length} credits
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="tv" className="mt-8">
                        {allTVCredits.length === 0 ? (
                            <div className="text-center py-12">
                                <Tv className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No TV credits found</h3>
                                <p className="text-muted-foreground">
                                    This person doesn't have any TV show credits in our database.
                                </p>
                            </div>                        ) : (
                            <div className="space-y-8">
                                {/* TV Shows Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {allTVCredits.slice(0, visibleTVCredits).map((credit, index) => (
                                        <div 
                                            key={`${credit.id}-${credit.credit_id}`} 
                                            className="space-y-2"
                                            ref={index === visibleTVCredits - 1 ? lastTVElementRef : null}
                                        >
                                            <MovieCard media={credit} />
                                            <div className="space-y-1 text-sm">
                                                <p className="font-medium text-center">{credit.role}</p>
                                                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                                    <Badge variant={credit.type === 'cast' ? 'default' : 'secondary'} className="text-xs">
                                                        {credit.type === 'cast' ? 'Acting' : 'Crew'}
                                                    </Badge>
                                                    {credit.type === 'cast' && credit.episode_count && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {credit.episode_count} ep
                                                        </Badge>
                                                    )}
                                                </div>
                                                {credit.first_air_date && (
                                                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(credit.first_air_date).getFullYear()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {visibleTVCredits < allTVCredits.length && (
                                    <div className="text-center py-4">
                                        <p className="text-muted-foreground text-sm">
                                            Showing {visibleTVCredits} of {allTVCredits.length} credits
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="about" className="mt-8">
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Full Biography */}
                            {person.biography && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold">Biography</h2>
                                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                            {person.biography}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Personal Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Personal Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Known For</span>
                                            <span className="font-medium">{person.known_for_department}</span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Gender</span>
                                            <span className="font-medium">
                                                {person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : 'Not specified'}
                                            </span>
                                        </div>

                                        {person.birthday && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Birthday</span>
                                                <span className="font-medium">{formatDate(person.birthday || "")}</span>
                                            </div>
                                        )}                                        {person.deathday && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Deathday</span>
                                                <span className="font-medium">{formatDate(person.deathday || "")}</span>
                                            </div>
                                        )}

                                        {person.place_of_birth && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Place of Birth</span>
                                                <span className="font-medium">{person.place_of_birth}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Also Known As */}
                                {person.also_known_as && person.also_known_as.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold">Also Known As</h3>
                                        <div className="space-y-2">
                                            {person.also_known_as.map((name, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Badge variant="outline">{name}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
