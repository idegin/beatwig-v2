"use client"

import {useState, useEffect, useRef} from "react"
import {Button} from "@/components/ui/button"
import Link from "next/link"
import {ArrowLeft, Youtube, X} from "lucide-react"
import {SeasonBrowser} from "@/components/SeasonBrowser"
import {useRouter, useSearchParams} from "next/navigation"
import { saveWatchHistory } from "@/lib/firebase"
import { Movie, TVShow } from "@/lib/tmdb"
import { WATCH_HISTORY } from "@/lib/constants"

interface MediaPlayerProps {
    mediaId: string
    mediaType: "movie" | "tv"
    title: string
    backUrl: string
    youtubeTrailerId?: string
    mediaDetails: Movie | TVShow
}

export function MediaPlayer({mediaId, mediaType, title, backUrl, youtubeTrailerId, mediaDetails}: MediaPlayerProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const iframeRef = useRef<HTMLIFrameElement>(null)

    const initialSeason = searchParams.get('season') ? parseInt(searchParams.get('season')!) : 1
    const initialEpisode = searchParams.get('episode') ? parseInt(searchParams.get('episode')!) : 1

    const [showBrowser, setShowBrowser] = useState<boolean>(false)
    const [activeSeasonNumber, setActiveSeasonNumber] = useState<number>(initialSeason)
    const [activeEpisodeNumber, setActiveEpisodeNumber] = useState<number>(initialEpisode)
    
    // Initialize progress with a random value between 30 and 80
    const [progress, setProgress] = useState<number>(() => Math.floor(Math.random() * 51) + 30) // Random number between 30 and 80
    const [duration, setDuration] = useState<number>(
        mediaType === "movie" 
            ? WATCH_HISTORY.DEFAULT_MOVIE_DURATION 
            : WATCH_HISTORY.DEFAULT_EPISODE_DURATION
    )
    const [episodeName, setEpisodeName] = useState<string>("")
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const lastSavedTimeRef = useRef<number>(Date.now())
    const isMountedRef = useRef<boolean>(true)
    const trackingStartedRef = useRef<boolean>(false)

    const vidsrcUrl = `https://vidsrc.xyz/embed/${mediaType}/${mediaId}`
    const episodeUrl = mediaType === 'tv'
        ? `https://vidsrc.xyz/embed/tv/${mediaId}/${activeSeasonNumber}/${activeEpisodeNumber}`
        : vidsrcUrl

    useEffect(() => {
        if (mediaType === 'tv') {
            const newParams = new URLSearchParams()
            newParams.set('season', activeSeasonNumber.toString())
            newParams.set('episode', activeEpisodeNumber.toString())
            router.replace(`?${newParams.toString()}`, {scroll: false})
            
            // Set a new random progress when changing episodes
            setProgress(Math.floor(Math.random() * 51) + 30)
        }
    }, [activeSeasonNumber, activeEpisodeNumber, mediaType, router])

    useEffect(() => {
        isMountedRef.current = true
        
        const startProgressTracking = () => {
            trackingStartedRef.current = true
            lastSavedTimeRef.current = Date.now()
            
            progressIntervalRef.current = setInterval(() => {
                if (!isMountedRef.current) return
                
                const now = Date.now()
                const secondsPassed = (now - lastSavedTimeRef.current) / 1000
                lastSavedTimeRef.current = now
                
                const progressIncrement = (secondsPassed / (duration * 60)) * 100
                const newProgress = Math.min(progress + progressIncrement, 100)
                setProgress(newProgress)
                
                const episodeInfo = mediaType === "tv" ? {
                    season: activeSeasonNumber,
                    episode: activeEpisodeNumber,
                    name: episodeName || `Episode ${activeEpisodeNumber}`
                } : undefined
                
                if (isMountedRef.current) {
                    saveWatchHistory(
                        mediaDetails, 
                        newProgress, 
                        episodeInfo,
                        duration
                    )
                }
            }, WATCH_HISTORY.SAVE_INTERVAL)
        }
        
        const progressTrackingDelay = setTimeout(() => {
            if (isMountedRef.current) {
                startProgressTracking()
            }
        }, 60000)
        
        return () => {
            isMountedRef.current = false
            
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
            }
            
            clearTimeout(progressTrackingDelay)
            
            if (trackingStartedRef.current) {
                const episodeInfo = mediaType === "tv" ? {
                    season: activeSeasonNumber,
                    episode: activeEpisodeNumber,
                    name: episodeName || `Episode ${activeEpisodeNumber}`
                } : undefined
                
                saveWatchHistory(
                    mediaDetails, 
                    progress, 
                    episodeInfo,
                    duration
                )
            }
        }
    }, [mediaDetails, mediaId, mediaType, activeSeasonNumber, activeEpisodeNumber, episodeName, duration, progress])

    useEffect(() => {
        if (mediaType === 'tv' && mediaDetails) {
            //@ts-ignore
            const seasons = (mediaDetails as TVShow)?.seasons || []
            const currentSeason = seasons.find((s:any)=> s.season_number === activeSeasonNumber)
            
            if (currentSeason) {
                setEpisodeName(`Episode ${activeEpisodeNumber}`)
                
                if (currentSeason.episodes) {
                    const episode = currentSeason.episodes.find((e:any) => e.episode_number === activeEpisodeNumber)
                    if (episode) {
                        setEpisodeName(episode.name)
                    }
                }
            } else {
                setEpisodeName(`Episode ${activeEpisodeNumber}`)
            }
        }
    }, [activeSeasonNumber, activeEpisodeNumber, mediaType, mediaDetails])

    const handleSelectEpisode = (seasonNumber: number, episodeNumber: number) => {
        if (trackingStartedRef.current) {
            const episodeInfo = {
                season: activeSeasonNumber,
                episode: activeEpisodeNumber,
                name: episodeName || `Episode ${activeEpisodeNumber}`
            }
            
            saveWatchHistory(
                mediaDetails,
                progress,
                episodeInfo,
                duration
            )
        }
        
        setActiveSeasonNumber(seasonNumber)
        setActiveEpisodeNumber(episodeNumber)
        lastSavedTimeRef.current = Date.now()
        // Set a new random progress when selecting episodes
        setProgress(Math.floor(Math.random() * 51) + 30)
    }

    const toggleBrowser = () => {
        setShowBrowser(!showBrowser)
    }

    return (
        <div className="relative min-h-screen bg-black">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <Button
                    asChild
                    variant="outline"
                    size={'sm'}
                >
                    <Link href={backUrl}>
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Go Back
                    </Link>
                </Button>

                {mediaType === 'tv' && (
                    <Button
                        variant={showBrowser ? "default" : "outline"}
                        size="sm"
                        onClick={toggleBrowser}
                    >
                        <Youtube className="mr-2 h-4 w-4"/>
                        {showBrowser ? "Hide Episodes" : "Browse Episodes"}
                    </Button>
                )}
            </div>

            {showBrowser && mediaType === 'tv' && (
                <div className="absolute top-16 left-4 z-50">
                    <SeasonBrowser
                        tvId={mediaId}
                        activeSeasonNumber={activeSeasonNumber}
                        activeEpisodeNumber={activeEpisodeNumber}
                        onSelectEpisode={handleSelectEpisode}
                    />
                </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center">
                <iframe
                    ref={iframeRef}
                    src={mediaType === 'tv' ? episodeUrl : vidsrcUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                />
            </div>
        </div>
    )
}
