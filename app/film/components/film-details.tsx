"use client"

import * as React from "react"
import Link from "next/link"
import { FilmHero } from "@/app/film/components/film-hero"
import { FilmInfo } from "@/app/film/components/film-info"
import { CastCrew } from "@/app/film/components/cast-crew"
import { FilmReviews } from "@/app/film/components/film-reviews"
import { MediaSection } from "@/app/film/components/media-section"
import { SeasonsEpisodes } from "@/app/film/components/seasons-episodes"
import { KeywordsSection } from "@/app/film/components/keywords-section"
import { FilmRow } from "@/components/film-row"
import { PageSection } from "@/components/page-section"
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Play } from "lucide-react"
import { FilmDetailsData } from "@/types/tmdb.types"

interface FilmDetailsProps {
    data: FilmDetailsData
    mediaType: "movie" | "tv"
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim()
}

export default function FilmDetails({ data, mediaType }: FilmDetailsProps) {
    const [trailerOpen, setTrailerOpen] = React.useState(false)
    const [isInWatchlist, setIsInWatchlist] = React.useState(false)

    const isTV = mediaType === "tv"
    const isMovie = mediaType === "movie"
    const slug = slugify(data.title)
    const watchUrl = isTV
        ? `/film/tv/${data.id}/${slug}/watch?season=1&episode=1`
        : `/film/movie/${data.id}/${slug}/watch`

    const handlePlayTrailer = () => {
        setTrailerOpen(true)
    }

    const handleAddToWatchlist = () => {
        setIsInWatchlist(!isInWatchlist)
    }

    const handleDownload = () => {
        console.log("Download clicked")
    }

    return (
        <div className="min-h-screen bg-background">
            <FilmHero
                title={data.title}
                overview={data.overview}
                backdropPath={data.backdrop_path}
                posterPath={data.poster_path}
                releaseDate={data.release_date}
                voteAverage={data.vote_average}
                genres={data.genres}
                runtime={data.runtime}
                certification={data.certification}
                videoKey={data.video_key}
                mediaType={mediaType}
                tagline={data.tagline}
                onPlayTrailer={handlePlayTrailer}
                onAddToWatchlist={handleAddToWatchlist}
                onDownload={handleDownload}
                isInWatchlist={isInWatchlist}
            />

            {isMovie && (
                <div className="container mx-auto px-4 -mt-8 relative z-20">
                    <div className="bg-linear-to-r from-primary/20 via-primary/10 to-primary/20 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-primary/30">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                                    Ready to Watch?
                                </h2>
                                <p className="text-muted-foreground text-sm md:text-base">
                                    Stream {data.title} now in HD quality
                                </p>
                            </div>
                            <Button
                                size="lg"
                                asChild
                                className="h-16 md:h-18 gap-4 rounded-2xl bg-primary px-10 md:px-14 text-lg md:text-xl font-bold text-primary-foreground shadow-xl shadow-primary/40 transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/50 group"
                            >
                                <Link href={watchUrl}>
                                    <div className="size-12 md:size-14 rounded-full bg-primary-foreground/20 flex items-center justify-center group-hover:bg-primary-foreground/30 transition-colors">
                                        <Play className="size-6 md:size-8 fill-current ml-1" />
                                    </div>
                                    Play Movie
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-8 space-y-16">
                {isTV && data.seasons && (
                    <SeasonsEpisodes
                        seasons={data.seasons}
                        showId={data.id}
                        showTitle={data.title}
                    />
                )}

                <MediaSection
                    videos={data.videos}
                    backdrops={data.backdrops}
                    posters={data.posters}
                />

                <CastCrew cast={data.cast} crew={data.crew} />

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <FilmReviews reviews={data.reviews} />
                    </div>
                    <div className="space-y-8">
                        <FilmInfo
                            releaseDate={data.release_date}
                            runtime={data.runtime}
                            budget={data.budget}
                            revenue={data.revenue}
                            status={data.status}
                            originalLanguage={data.original_language}
                            productionCompanies={data.production_companies}
                            productionCountries={data.production_countries}
                            spokenLanguages={data.spoken_languages}
                            numberOfSeasons={data.number_of_seasons}
                            numberOfEpisodes={data.number_of_episodes}
                        />
                        <KeywordsSection keywords={data.keywords} />
                    </div>
                </div>
            </div>

            <PageSection
                heading={isTV ? "More Like This" : "Similar Movies"}
                subHeading="Based on your interest"
            >
                <FilmRow films={data.similar} />
            </PageSection>

            {data.video_key && (
                <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
                    <DialogContent className="max-w-7xl w-[95vw] p-0 bg-black border-0 overflow-hidden" showCloseButton={false}>
                        <DialogTitle className="sr-only">{data.title} - Trailer</DialogTitle>
                        <div className="relative aspect-video">
                            <iframe
                                src={`https://www.youtube.com/embed/${data.video_key}?autoplay=1`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTrailerOpen(false)}
                                className="absolute top-4 right-4 size-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
                            >
                                <X className="size-5" />
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}