import {getMovieDetails, getMovieVideos} from "@/lib/tmdb"
import {MediaPlayer} from "@/components/media-player"
import type {Metadata} from "next"

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
    //@ts-ignore
    const movieDetails = await getMovieDetails(params.id)

    return {
        title: `Watch ${movieDetails.title} | BeatWig`,
        description: `Watch ${movieDetails.title} online. ${movieDetails.overview?.substring(0, 100)}...`,
        robots: {
            index: false,
            follow: false,
        },
    }
}

export default async function WatchPage({params}: Props) {
    //@ts-ignore
    const [movieDetails, videosData] = await Promise.all([getMovieDetails(params.id), getMovieVideos(params.id)])

    const videos = videosData.results || []
    const trailer = videos.find((video: any) => video.type === "Trailer" && video.site === "YouTube") || videos[0]

    const trailerKey = trailer?.key || ""

    return (
        <MediaPlayer
            //@ts-ignore
            mediaId={params.id}
            mediaType="movie"
            title={movieDetails.title}
            //@ts-ignore
            backUrl={`/movie/${params.id}`}
            youtubeTrailerId={trailerKey}
        />
    )
}

