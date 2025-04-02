"use client"

import {useState, useEffect} from "react"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Skeleton} from "@/components/ui/skeleton"
import {Episode, Season, SeasonResponse} from "@/lib/tmdb"
import {CalendarDays, Clock, ArrowLeft} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SeasonBrowserProps {
    tvId: string
    activeSeasonNumber?: number
    activeEpisodeNumber?: number
    onSelectEpisode?: (seasonNumber: number, episodeNumber: number) => void
}

export function SeasonBrowser(
    {
        tvId,
        activeSeasonNumber,
        activeEpisodeNumber,
        onSelectEpisode
    }: SeasonBrowserProps) {
    const [seasons, setSeasons] = useState<Season[]>([])
    const [selectedSeason, setSelectedSeason] = useState<SeasonResponse | null>(null)
    const [currentSeasonNumber, setCurrentSeasonNumber] = useState<number>(activeSeasonNumber || 1)
    const [loading, setLoading] = useState<boolean>(true)
    const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(false)
    const [view, setView] = useState<'seasons' | 'episodes'>('seasons')

    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/tv/${tvId}/browser`)
                const data = await response.json()
                console.log('SEASONS DATA:::', data)
                setSeasons(data || [])

                // If we have an active season number, we can go directly to episodes view
                if (data && data.length > 0) {
                    const initialSeason = activeSeasonNumber || data[0].season_number
                    setCurrentSeasonNumber(initialSeason)
                    
                    if (activeSeasonNumber) {
                        await fetchSeasonDetails(initialSeason)
                        setView('episodes')
                    }
                }
            } catch (error) {
                console.error("Error fetching seasons:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchSeasons()
    }, [tvId, activeSeasonNumber])

    // Update current season number when activeSeasonNumber prop changes
    useEffect(() => {
        if (activeSeasonNumber && activeSeasonNumber !== currentSeasonNumber) {
            setCurrentSeasonNumber(activeSeasonNumber)
            fetchSeasonDetails(activeSeasonNumber)
            setView('episodes')
        }
    }, [activeSeasonNumber])

    const fetchSeasonDetails = async (seasonNumber: number) => {
        try {
            setLoadingEpisodes(true)
            const response = await fetch(`/api/tv/${tvId}/browser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({seasonNumber}),
            })
            const data = await response.json()
            setSelectedSeason(data)
        } catch (error) {
            console.error("Error fetching season details:", error)
        } finally {
            setLoadingEpisodes(false)
        }
    }

    const handleSeasonSelect = async (seasonNumber: number) => {
        setCurrentSeasonNumber(seasonNumber)
        await fetchSeasonDetails(seasonNumber)
        setView('episodes')
    }

    const handleBackToSeasons = () => {
        setView('seasons')
    }

    const handleEpisodeClick = (episode: Episode) => {
        onSelectEpisode?.(episode.season_number, episode.episode_number)
    }

    if (loading) {
        return <SeasonSkeleton/>
    }

    const headerText = view === 'seasons'
        ? 'Select Season' 
        : selectedSeason?.name || `Season ${currentSeasonNumber}`;

    return (
        <div className="w-96 bg-card/90 backdrop-blur-lg text-foreground rounded-lg shadow-2xl border overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
                {view === 'episodes' && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mr-2 p-0 h-8 w-8" 
                        onClick={handleBackToSeasons}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <h3 className="text-lg font-semibold">{headerText}</h3>
                {view === 'episodes' && activeEpisodeNumber && (
                    <Badge variant="secondary" className="ml-auto">
                        Episode {activeEpisodeNumber}
                    </Badge>
                )}
            </div>

            {view === 'seasons' ? (
                <ScrollArea className="h-[calc(100vh-200px)] max-h-[500px]">
                    <div className="grid grid-cols-2 gap-2 p-3">
                        {seasons.map((season) => {
                            const isActiveSeason = season.season_number === activeSeasonNumber;
                            return (
                                <div 
                                    key={season.id}
                                    onClick={() => handleSeasonSelect(season.season_number)}
                                    className={`flex flex-col items-center p-2 rounded-md transition-colors cursor-pointer
                                        ${isActiveSeason ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-white/10'}`}
                                >
                                    <div className="relative h-40 w-full rounded overflow-hidden mb-2">
                                        {season.poster_path ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                                                alt={season.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full bg-gray-800 text-gray-500">
                                                No Image
                                            </div>
                                        )}
                                        {isActiveSeason && (
                                            <div className="absolute top-1 right-1">
                                                <Badge className="bg-primary text-primary-foreground">Current</Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium text-sm">{season.name}</p>
                                        <p className="text-xs text-gray-400">{season.episode_count} episodes</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            ) : loadingEpisodes ? (
                <div className="p-4 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex gap-3">
                            <Skeleton className="h-24 w-16 rounded"/>
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4"/>
                                <Skeleton className="h-3 w-1/2"/>
                                <Skeleton className="h-3 w-2/3"/>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <ScrollArea className="h-[calc(100vh-200px)] max-h-[500px]">
                    <div className="p-2 space-y-2">
                        {selectedSeason?.episodes?.map((episode) => {
                            const isActiveEpisode = activeEpisodeNumber === episode.episode_number && 
                                                   activeSeasonNumber === episode.season_number;
                            return (
                                <div
                                    key={episode.id}
                                    onClick={() => handleEpisodeClick(episode)}
                                    className={`flex p-2 gap-3 rounded-md transition-colors cursor-pointer
                                        ${isActiveEpisode 
                                            ? "bg-primary/20 ring-1 ring-primary" 
                                            : "hover:bg-white/10"}`}
                                >
                                    <div className="relative h-20 w-36 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                                        {episode.still_path ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                                                alt={episode.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full text-gray-500">
                                                No Image
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs px-1 py-0.5 text-center">
                                            Episode {episode.episode_number}
                                            {isActiveEpisode && <span className="ml-1 font-bold text-primary">• Now Playing</span>}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">
                                            {episode.name}
                                            {isActiveEpisode && (
                                                <Badge variant="secondary" className="ml-2 text-[10px] py-0">
                                                    PLAYING
                                                </Badge>
                                            )}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                            <div className="flex items-center">
                                                <CalendarDays className="h-3 w-3 mr-1"/>
                                                {episode.air_date || "TBA"}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-3 w-3 mr-1"/>
                                                {episode.runtime || "?"} min
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-300 line-clamp-2 mt-1">{episode.overview || "No description available."}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            )}
        </div>
    )
}

function SeasonSkeleton() {
    return (
        <div
            className="w-80 bg-black/90 backdrop-blur-lg text-white rounded-lg shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
                <Skeleton className="h-6 w-40"/>
            </div>
            <div className="p-2">
                <div className="flex gap-2 px-2 py-1">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-8 w-24 rounded"/>
                    ))}
                </div>
                <div className="p-2 space-y-4 mt-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-3">
                            <Skeleton className="h-20 w-36 rounded"/>
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4"/>
                                <Skeleton className="h-3 w-1/2"/>
                                <Skeleton className="h-3 w-2/3"/>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

