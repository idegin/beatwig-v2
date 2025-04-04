"use client"

import {useState, useEffect, useRef} from "react"
import {Button} from "@/components/ui/button"
import Link from "next/link"
import {ArrowLeft, Youtube, X} from "lucide-react"
import {SeasonBrowser} from "@/components/SeasonBrowser"
import {useRouter, useSearchParams} from "next/navigation"
import { saveWatchHistory } from "@/lib/firebase"
import { Movie, TVShow } from "@/lib/tmdb"

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
    
    // Track watch progress
    const [progress, setProgress] = useState<number>(0)
    const [duration, setDuration] = useState<number>(mediaType === "movie" ? 120 : 45) // Default duration in minutes
    const [episodeName, setEpisodeName] = useState<string>("")
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const lastSavedTimeRef = useRef<number>(Date.now())

    const vidsrcUrl = `https://vidsrc.xyz/embed/${mediaType}/${mediaId}`
    const episodeUrl = mediaType === 'tv'
        ? `https://vidsrc.xyz/embed/tv/${mediaId}/${activeSeasonNumber}/${activeEpisodeNumber}`
        : vidsrcUrl

    useEffect(() => {
        if (mediaType === 'tv') {
            // Update URL when season or episode changes without full page reload
            const newParams = new URLSearchParams()
            newParams.set('season', activeSeasonNumber.toString())
            newParams.set('episode', activeEpisodeNumber.toString())
            router.replace(`?${newParams.toString()}`, {scroll: false})
            
            // Reset progress when episode changes
            setProgress(0)
        }
    }, [activeSeasonNumber, activeEpisodeNumber, mediaType, router])

    // Set up watch history tracking
    useEffect(() => {
        // Start with a small progress value to indicate the user has started watching
        setProgress(1)
        
        // Save initial watch history
        const saveInitialWatchHistory = async () => {
            const episodeInfo = mediaType === "tv" ? {
                season: activeSeasonNumber,
                episode: activeEpisodeNumber,
                name: episodeName || `Episode ${activeEpisodeNumber}`
            } : undefined
            
            await saveWatchHistory(
                mediaDetails,
                1, // Initial progress (just started)
                episodeInfo,
                duration
            )
        }
        
        saveInitialWatchHistory()

        // Set up interval to periodically save watch history
        progressIntervalRef.current = setInterval(() => {
            // Increment progress based on time passed
            const now = Date.now()
            const secondsPassed = (now - lastSavedTimeRef.current) / 1000
            lastSavedTimeRef.current = now
            
            // Calculate new progress (rough estimation)
            // A 2-hour movie with 10-second updates would increment by ~0.14% each time
            // A 45-minute episode would increment by ~0.37% each time
            const progressIncrement = (secondsPassed / (duration * 60)) * 100
            
            // Cap progress at 100%
            const newProgress = Math.min(progress + progressIncrement, 100)
            setProgress(newProgress)
            
            // Save watch progress to Firebase
            const episodeInfo = mediaType === "tv" ? {
                season: activeSeasonNumber,
                episode: activeEpisodeNumber,
                name: episodeName || `Episode ${activeEpisodeNumber}`
            } : undefined
            
            saveWatchHistory(
                mediaDetails, 
                newProgress, 
                episodeInfo,
                duration
            )
        }, 10000) // Update every 10 seconds
        
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
            }
        }
    }, [mediaDetails, mediaId, mediaType, activeSeasonNumber, activeEpisodeNumber, episodeName, duration])

    // When episode changes, update episode name if available
    useEffect(() => {
        if (mediaType === 'tv') {
            // Try to fetch episode name from media details or API if needed
            // For now, use a placeholder
            setEpisodeName(`Episode ${activeEpisodeNumber}`)
        }
    }, [activeSeasonNumber, activeEpisodeNumber, mediaType])

    const handleSelectEpisode = (seasonNumber: number, episodeNumber: number) => {
        // Save progress of current episode before changing
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
        
        // Update to new episode
        setActiveSeasonNumber(seasonNumber)
        setActiveEpisodeNumber(episodeNumber)
        lastSavedTimeRef.current = Date.now() // Reset timer
        setProgress(1) // Start with minimal progress on the new episode
    }

    const toggleBrowser = () => {
        setShowBrowser(!showBrowser)
    }

    return (
        <div className="relative min-h-screen bg-black">
            {/* Back button and source toggle */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <Button
                    asChild
                    variant="outline"
                    size={'sm'}
                    // className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
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
                        // className="bg-black/70 backdrop-blur-sm hover:bg-black/80"
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
