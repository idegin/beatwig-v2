import {getMovieDetails, getMovieVideos} from "@/lib/tmdb"
import {MediaPlayer} from "@/components/media-player"
import type {Metadata} from "next"

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const { id } = await params
    const movieDetails = await getMovieDetails(id)

    return {
        title: `Watch ${movieDetails.title} | BeatWig`,
        description: `Watch ${movieDetails.title} online. ${movieDetails.overview?.substring(0, 100)}...`,
        robots: {
            index: false,
            follow: false,
        },
    }
}

export default async function MovieWatchPage({params}: Props) {
    const { id } = await params
    const [movieDetails, videosData] = await Promise.all([getMovieDetails(id), getMovieVideos(id)])

    const videos = videosData.results || []
    const trailer = videos.find((video: any) => video.type === "Trailer" && video.site === "YouTube") || videos[0]

    const trailerKey = trailer?.key || ""

    return (
        <MediaPlayer
            mediaDetails={movieDetails}
            mediaId={id}
            mediaType="movie"
            title={movieDetails.title}
            backUrl={`/movie/${id}`}
            youtubeTrailerId={trailerKey}
        />
    )
}

