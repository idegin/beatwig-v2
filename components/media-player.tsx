"use client"

import {useState, useEffect} from "react"
import {Button} from "@/components/ui/button"
import Link from "next/link"
import {ArrowLeft, Youtube, X} from "lucide-react"
import {SeasonBrowser} from "@/components/SeasonBrowser"
import {useRouter, useSearchParams} from "next/navigation"

interface MediaPlayerProps {
    mediaId: string
    mediaType: "movie" | "tv"
    title: string
    backUrl: string
    youtubeTrailerId?: string
}

export function MediaPlayer({mediaId, mediaType, title, backUrl, youtubeTrailerId}: MediaPlayerProps) {
    const searchParams = useSearchParams()
    const router = useRouter()

    const initialSeason = searchParams.get('season') ? parseInt(searchParams.get('season')!) : 1
    const initialEpisode = searchParams.get('episode') ? parseInt(searchParams.get('episode')!) : 1

    const [showBrowser, setShowBrowser] = useState<boolean>(false)
    const [activeSeasonNumber, setActiveSeasonNumber] = useState<number>(initialSeason)
    const [activeEpisodeNumber, setActiveEpisodeNumber] = useState<number>(initialEpisode)

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
        }
    }, [activeSeasonNumber, activeEpisodeNumber, mediaType, router])

    const handleSelectEpisode = (seasonNumber: number, episodeNumber: number) => {
        setActiveSeasonNumber(seasonNumber)
        setActiveEpisodeNumber(episodeNumber)
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
