"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getTMDBImageUrl, formatDate, formatRuntime, formatRating, formatNumber } from "@/lib/utils"
import { BACKDROP_SIZES, POSTER_SIZES, PROFILE_SIZES } from "@/lib/constants"
import { MediaSection } from "@/components/media-section"
import { VideosGallery } from "@/components/videos-gallery"
import { VideoPopup } from "@/components/video-popup"
import {
    Calendar,
    CalendarDays,
    ChevronRight,
    Clock,
    DollarSign,
    ExternalLink,
    Film,
    Globe,
    Layers,
    Play,
    Star,
    Tag,
    Tv,
    X
} from "lucide-react"
import { MovieTorrent } from "@/lib/yts";
import MediaDetailsActions from "@/components/media-details/MediaDetailsActions";
import type { Season, Episode, SeasonResponse } from "@/lib/tmdb";
import { getMediaWatchProgress, type WatchHistoryItem } from "@/lib/firebase";
import { useAuth } from "@/context/auth.context";

// Seasons Section Component for TV Shows
interface SeasonsSectionProps {
    seasons: Season[]
    tvId: number
}

function SeasonsSection({ seasons, tvId }: SeasonsSectionProps) {
    const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
    const [seasonDetails, setSeasonDetails] = useState<SeasonResponse | null>(null)
    const [loading, setLoading] = useState(false)

    // Filter out specials (season 0) if desired, or keep them
    const regularSeasons = seasons.filter(s => s.season_number > 0)

    const fetchSeasonDetails = async (seasonNumber: number) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/tv/${tvId}/browser`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ seasonNumber }),
            })
            const data = await response.json()
            setSeasonDetails(data)
        } catch (error) {
            console.error("Error fetching season details:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSeasonClick = (seasonNumber: number) => {
        if (selectedSeason === seasonNumber) {
            setSelectedSeason(null)
            setSeasonDetails(null)
        } else {
            setSelectedSeason(seasonNumber)
            fetchSeasonDetails(seasonNumber)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">
                    {regularSeasons.length} {regularSeasons.length === 1 ? 'Season' : 'Seasons'}
                </h2>
            </div>

            {/* Seasons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {regularSeasons.map((season) => (
                    <div
                        key={season.id}
                        onClick={() => handleSeasonClick(season.season_number)}
                        className={`group cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
                            selectedSeason === season.season_number 
                                ? 'ring-2 ring-primary shadow-lg shadow-primary/20' 
                                : 'hover:ring-2 hover:ring-primary/50'
                        }`}
                    >
                        <div className="relative aspect-[2/3] bg-muted">
                            {season.poster_path ? (
                                <Image
                                    src={getTMDBImageUrl(season.poster_path, POSTER_SIZES.MEDIUM)}
                                    alt={season.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                    <Tv className="h-12 w-12 text-muted-foreground/50" />
                                </div>
                            )}
                            
                            {/* Overlay with episode count */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h3 className="font-semibold text-white text-sm line-clamp-1">{season.name}</h3>
                                <p className="text-xs text-white/70 mt-0.5">{season.episode_count} Episodes</p>
                            </div>
                            
                            {/* Selected indicator */}
                            {selectedSeason === season.season_number && (
                                <div className="absolute top-2 right-2">
                                    <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Episodes Panel */}
            {selectedSeason && (
                <div className="mt-6 border rounded-lg overflow-hidden bg-card/50 backdrop-blur">
                    <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                        <div className="flex items-center gap-3">
                            <Film className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg">
                                Season {selectedSeason} Episodes
                            </h3>
                            {seasonDetails && (
                                <Badge variant="secondary">
                                    {seasonDetails.episodes?.length || 0} episodes
                                </Badge>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSelectedSeason(null)
                                setSeasonDetails(null)
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {loading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-24 w-40 rounded-lg flex-shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : seasonDetails?.episodes && seasonDetails.episodes.length > 0 ? (
                        <div className="divide-y">
                            {seasonDetails.episodes.map((episode) => (
                                <Link
                                    key={episode.id}
                                    href={`/tv/${tvId}/watch?season=${selectedSeason}&episode=${episode.episode_number}`}
                                    className="flex gap-4 p-4 hover:bg-muted/50 transition-colors group"
                                >
                                    {/* Episode Thumbnail */}
                                    <div className="relative h-24 w-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                        {episode.still_path ? (
                                            <Image
                                                src={getTMDBImageUrl(episode.still_path, BACKDROP_SIZES.SMALL)}
                                                alt={episode.name}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                                <Play className="h-8 w-8 text-muted-foreground/50" />
                                            </div>
                                        )}
                                        {/* Episode number badge */}
                                        <div className="absolute bottom-1 left-1">
                                            <Badge variant="secondary" className="text-xs bg-black/70 hover:bg-black/70">
                                                E{episode.episode_number}
                                            </Badge>
                                        </div>
                                        {/* Play overlay on hover */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="h-8 w-8 text-white fill-white" />
                                        </div>
                                    </div>

                                    {/* Episode Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                                {episode.name}
                                            </h4>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                            {episode.air_date && (
                                                <div className="flex items-center gap-1">
                                                    <CalendarDays className="h-3 w-3" />
                                                    <span>{formatDate(episode.air_date)}</span>
                                                </div>
                                            )}
                                            {episode.runtime && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{episode.runtime} min</span>
                                                </div>
                                            )}
                                            {episode.vote_average > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                    <span>{episode.vote_average.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                            {episode.overview || "No description available."}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            <Tv className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No episodes available for this season.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

interface MediaDetailsProps {
    data: any
    type: "movie" | "tv"
    torrents?: MovieTorrent[]
}

export function MediaDetails({ data, type, torrents }: MediaDetailsProps) {
    const [showTrailer, setShowTrailer] = useState(false);
    const [watchProgress, setWatchProgress] = useState<WatchHistoryItem | null>(null);
    const { user } = useAuth();

    // Check for watch progress
    useEffect(() => {
        const checkWatchProgress = async () => {
            if (!user || !data?.id) return;
            try {
                const progress = await getMediaWatchProgress(data.id.toString(), type);
                setWatchProgress(progress);
            } catch (error) {
                console.error('Error fetching watch progress:', error);
            }
        };
        checkWatchProgress();
    }, [user, data?.id, type]);

    if (!data) return null

    const isMovieType = type === "movie"
    const title = isMovieType ? data.title : data.name
    const releaseDate = isMovieType ? data.release_date : data.first_air_date
    const runtime = isMovieType ? data.runtime : data.episode_run_time?.[0] || 0
    const genres = data.genres || []
    const videos = data.videos?.results || []
    const trailer = videos.find((video: any) => video.type === "Trailer" && video.site === "YouTube") || videos[0]
    const cast = data.credits?.cast || []
    const crew = data.credits?.crew || []
    const director = crew.find((person: any) => person.job === "Director")
    const recommendations = data.recommendations?.results || []
    const reviews = data.reviews?.results || []
    const backdrops = data.images?.backdrops || []
    const posters = data.images?.posters || []

    const backgroundImage = data.backdrop_path
        ? getTMDBImageUrl(data.backdrop_path, BACKDROP_SIZES.ORIGINAL)
        : data.poster_path
            ? getTMDBImageUrl(data.poster_path, POSTER_SIZES.ORIGINAL)
            : "/placeholder.svg?height=720&width=1280"

    // Build watch URL with season/episode if there's watch history for TV shows
    const watchUrl = watchProgress && type === "tv" && watchProgress.season && watchProgress.episode
        ? `/${type}/${data.id}/watch?season=${watchProgress.season}&episode=${watchProgress.episode}`
        : `/${type}/${data.id}/watch`

    return (
        <div className="flex flex-col">
            <div className="relative h-[80vh] min-h-[500px] w-full overflow-hidden">
                <img
                    src={backgroundImage || "/placeholder.svg"}
                    alt={title}
                    className="w-full h-full object-cover absolute inset-0"
                    loading="eager"
                    onError={(e) => {
                        if (data.poster_path && e.currentTarget.src !== getTMDBImageUrl(data.poster_path, POSTER_SIZES.ORIGINAL)) {
                            e.currentTarget.src = getTMDBImageUrl(data.poster_path, POSTER_SIZES.ORIGINAL)
                        }
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                    <Link href={watchUrl}
                        className={'flex flex-col items-center gap-3 group'}>
                        <div className="h-20 w-20 flex items-center justify-center rounded-full hover:bg-primary-foreground hover:text-primary bg-primary text-primary-foreground transition-colors duration-300">
                            <Play className="h-8 w-8" />
                        </div>
                        {watchProgress ? (
                            <div className="flex flex-col items-center">
                                <span className="text-white font-medium text-lg drop-shadow-lg">Continue Watching</span>
                                {type === "tv" && watchProgress.season && watchProgress.episode && (
                                    <span className="text-white/80 text-sm drop-shadow-lg">
                                        S{watchProgress.season} E{watchProgress.episode}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="sr-only">Watch</span>
                        )}
                    </Link>
                </div>
            </div>

            <div className={'flex justify-center'}>
                <div className="container py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        <div className="md:col-span-1">
                            <div className="sticky top-20">
                                <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-lg">
                                    <img
                                        src={getTMDBImageUrl(data.poster_path, POSTER_SIZES.LARGE) || "/placeholder.svg?height=450&width=300"}
                                        alt={title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>

                                <MediaDetailsActions
                                    data={data}
                                    type={type}
                                    torrents={torrents}
                                />
                            </div>
                        </div>


                        <div className="md:col-span-2 lg:col-span-3">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    {genres.map((genre: any) => (
                                        <Badge key={genre.id} variant="secondary">
                                            {genre.name}
                                        </Badge>
                                    ))}
                                </div>

                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                                    {title}
                                </h1>

                                {data.tagline &&
                                    <p className="mt-2 text-lg italic text-muted-foreground">
                                        {data.tagline}
                                    </p>
                                }

                                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                                    {releaseDate && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{formatDate(releaseDate)}</span>
                                        </div>
                                    )}

                                    {runtime > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>{formatRuntime(runtime)}</span>
                                        </div>
                                    )}

                                    {data.vote_average > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-500" />
                                            <span>
                                                {formatRating(data.vote_average)} ({formatNumber(data.vote_count)})
                                            </span>
                                        </div>
                                    )}

                                    {isMovieType && data.status && <Badge variant="outline">{data.status}</Badge>}

                                    {!isMovieType && data.number_of_seasons && (
                                        <div className="flex items-center gap-1">
                                            <Film className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {data.number_of_seasons} {data.number_of_seasons === 1 ? "Season" : "Seasons"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Tabs defaultValue={isMovieType ? "overview" : "seasons"} className="mt-8">
                                <TabsList className={`grid ${!isMovieType ? 'grid-cols-5' : 'grid-cols-4'} md:w-auto md:inline-flex`}>
                                    {!isMovieType && <TabsTrigger value="seasons">Seasons</TabsTrigger>}
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                                    <TabsTrigger value="media">Trailers</TabsTrigger>
                                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="mt-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
                                            <p className="text-muted-foreground">{data.overview || "No overview available."}</p>
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-semibold mb-4">Details</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {isMovieType && data.budget > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <h3 className="font-medium">Budget</h3>
                                                            <p className="text-muted-foreground">${formatNumber(data.budget)}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {isMovieType && data.revenue > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <h3 className="font-medium">Revenue</h3>
                                                            <p className="text-muted-foreground">${formatNumber(data.revenue)}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {data.original_language && (
                                                    <div className="flex items-start gap-2">
                                                        <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <h3 className="font-medium">Original Language</h3>
                                                            <p className="text-muted-foreground">
                                                                {new Intl.DisplayNames(["en"], { type: "language" }).of(data.original_language)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {data.production_companies && data.production_companies.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <Film className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <h3 className="font-medium">Production</h3>
                                                            <p className="text-muted-foreground">
                                                                {data.production_companies.map((company: any) => company.name).join(", ")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {!isMovieType && data.created_by && data.created_by.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <h3 className="font-medium">Created By</h3>
                                                            <p className="text-muted-foreground">
                                                                {data.created_by.map((person: any) => person.name).join(", ")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {!isMovieType && data.networks && data.networks.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <Film className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <h3 className="font-medium">Networks</h3>
                                                            <p className="text-muted-foreground">
                                                                {data.networks.map((network: any) => network.name).join(", ")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {data.homepage && (
                                                    <div className="flex items-start gap-2">
                                                        <ExternalLink className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <h3 className="font-medium">Website</h3>
                                                            <a
                                                                href={data.homepage}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline"
                                                            >
                                                                Official Website
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Keywords/Tags */}
                                        {data.keywords &&
                                            ((isMovieType && data.keywords.keywords && data.keywords.keywords.length > 0) ||
                                                (!isMovieType && data.keywords.results && data.keywords.results.length > 0)) && (
                                                <div>
                                                    <h2 className="text-xl font-semibold mb-2">Keywords</h2>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(isMovieType ? data.keywords.keywords : data.keywords.results).map((keyword: any) => (
                                                            <Link key={keyword.id} href={`/keyword/${keyword.id}?type=${type}`}>
                                                                <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                                                                    {keyword.name}
                                                                </Badge>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </TabsContent>

                                {/* Seasons Tab - Only for TV Shows */}
                                {!isMovieType && data.seasons && (
                                    <TabsContent value="seasons" className="mt-6">
                                        <SeasonsSection seasons={data.seasons} tvId={data.id} />
                                    </TabsContent>
                                )}

                                {/* Cast & Crew Tab */}
                                <TabsContent value="cast" className="mt-6">
                                    <div className="space-y-6">
                                        {/* Top Cast */}
                                        {cast.length > 0 ? (
                                            <div>
                                                <h2 className="text-xl font-semibold mb-4">Top Cast</h2>
                                                <div
                                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 z-0">
                                                    {cast.slice(0, 10).map((person: any) => (
                                                        <Link
                                                            key={`${person.id}-${person.cast_id || person.order}`}
                                                            href={`/person/${person.id}`}
                                                            className="group "
                                                        >
                                                            <div
                                                                className="aspect-[2/3] relative rounded-lg overflow-hidden">
                                                                <Image
                                                                    src={
                                                                        getTMDBImageUrl(person.profile_path, PROFILE_SIZES.MEDIUM) ||
                                                                        "/placeholder.svg?height=300&width=200" ||
                                                                        "/placeholder.svg" ||
                                                                        "/placeholder.svg"
                                                                    }
                                                                    alt={person.name}
                                                                    fill
                                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                                />
                                                            </div>
                                                            <div className="mt-2">
                                                                <h3 className="font-medium line-clamp-1">{person.name}</h3>
                                                                <p className="text-sm text-muted-foreground line-clamp-1">{person.character}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>

                                                {cast.length > 10 && (
                                                    <Button variant="link" className="mt-4" asChild>
                                                        <Link href={`/${type}/${data.id}/cast`}>View Full Cast &
                                                            Crew</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No cast information available.</p>
                                        )}

                                        {/* Key Crew */}
                                        {crew.length > 0 && (
                                            <div className="mt-8">
                                                <h2 className="text-xl font-semibold mb-4">Key Crew</h2>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    {crew
                                                        .filter((person: any) =>
                                                            ["Director", "Producer", "Screenplay", "Writer", "Creator"].includes(person.job),
                                                        )
                                                        .slice(0, 6)
                                                        .map((person: any) => (
                                                            <div key={`${person.id}-${person.job}`}
                                                                className="flex items-start gap-3">
                                                                <div
                                                                    className="h-12 w-12 relative rounded-full overflow-hidden">
                                                                    <Image
                                                                        src={
                                                                            getTMDBImageUrl(person.profile_path, PROFILE_SIZES.SMALL) ||
                                                                            "/placeholder.svg?height=45&width=45" ||
                                                                            "/placeholder.svg" ||
                                                                            "/placeholder.svg"
                                                                        }
                                                                        alt={person.name}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-medium">{person.name}</h3>
                                                                    <p className="text-sm text-muted-foreground">{person.job}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Media Tab */}
                                <TabsContent value="media" className="mt-6">
                                    <div className="space-y-8">
                                        {/* Videos */}
                                        {videos.length > 0 ? (
                                            <div>
                                                <h2 className="text-xl font-semibold mb-4">Videos</h2>
                                                <VideosGallery videos={videos} />
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No videos available.</p>
                                        )}

                                        {/* Backdrops */}
                                        {backdrops.length > 0 ? (
                                            <div>
                                                <h2 className="text-xl font-semibold mb-4">Backdrops</h2>
                                                <ScrollArea className="w-full whitespace-nowrap">
                                                    <div className="flex gap-4">
                                                        {backdrops.slice(0, 10).map((image: any, index: number) => (
                                                            <div
                                                                key={index}
                                                                className="relative w-[300px] h-[169px] rounded-lg overflow-hidden shrink-0"
                                                            >
                                                                <Image
                                                                    src={
                                                                        getTMDBImageUrl(image.file_path, BACKDROP_SIZES.MEDIUM) ||
                                                                        "/placeholder.svg?height=169&width=300" ||
                                                                        "/placeholder.svg" ||
                                                                        "/placeholder.svg"
                                                                    }
                                                                    alt={`Backdrop ${index + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No backdrops available.</p>
                                        )}

                                        {/* Posters */}
                                        {posters.length > 0 ? (
                                            <div>
                                                <h2 className="text-xl font-semibold mb-4">Posters</h2>
                                                <ScrollArea className="w-full whitespace-nowrap">
                                                    <div className="flex gap-4">
                                                        {posters.slice(0, 10).map((image: any, index: number) => (
                                                            <div
                                                                key={index}
                                                                className="relative w-[150px] h-[225px] rounded-lg overflow-hidden shrink-0"
                                                            >
                                                                <Image
                                                                    src={
                                                                        getTMDBImageUrl(image.file_path, POSTER_SIZES.MEDIUM) ||
                                                                        "/placeholder.svg?height=225&width=150" ||
                                                                        "/placeholder.svg" ||
                                                                        "/placeholder.svg"
                                                                    }
                                                                    alt={`Poster ${index + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No posters available.</p>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Reviews Tab */}
                                <TabsContent value="reviews" className="mt-6">
                                    {reviews.length > 0 ? (
                                        <div className="space-y-6">
                                            {reviews.slice(0, 5).map((review: any) => (
                                                <div key={review.id} className="border rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className="h-10 w-10 relative rounded-full overflow-hidden bg-muted">
                                                            {review.author_details.avatar_path ? (
                                                                <Image
                                                                    src={
                                                                        review.author_details.avatar_path.startsWith("/http")
                                                                            ? review.author_details.avatar_path.substring(1)
                                                                            : getTMDBImageUrl(review.author_details.avatar_path, "original")
                                                                    }
                                                                    alt={review.author}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                                    {review.author.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium">{review.author}</h3>
                                                            <div
                                                                className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <time dateTime={review.created_at}>
                                                                    {new Date(review.created_at).toLocaleDateString()}
                                                                </time>
                                                                {review.author_details.rating && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <div className="flex items-center">
                                                                            <Star
                                                                                className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                                                                            <span>{review.author_details.rating}/10</span>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <p className="text-muted-foreground line-clamp-4">{review.content}</p>
                                                        {review.content.length > 300 && (
                                                            <Button variant="link" size="sm" className="mt-1 h-auto p-0"
                                                                asChild>
                                                                <a href={review.url} target="_blank"
                                                                    rel="noopener noreferrer">
                                                                    Read Full Review
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-muted-foreground">No reviews available.</p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {recommendations.length > 0 && (
                        <div className="mt-16">
                            <MediaSection
                                title="✨ AI Recommendations"
                                items={recommendations.slice(0, 12)}
                                viewAllHref={`/${type}/${data.id}/recommendations`}
                            />
                        </div>
                    )}
                </div>
            </div>

            {trailer && (
                <VideoPopup
                    videoId={trailer.key}
                    title={`${title} - ${trailer.name}`}
                    isOpen={showTrailer}
                    onClose={() => setShowTrailer(false)}
                />
            )}
        </div>
    )
}

