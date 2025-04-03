import {getTVShowDetails, getTVShowVideos} from "@/lib/tmdb"
import {MediaPlayer} from "@/components/media-player"
import type {Metadata} from "next"

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
    //@ts-ignore
    const tvDetails = await getTVShowDetails(params.id)

    return {
        title: `Watch ${tvDetails.name} | BeatWig`,
        description: `Watch ${tvDetails.name} online. ${tvDetails.overview?.substring(0, 100)}...`,
        robots: {
            index: false,
            follow: false,
        },
    }
}

export default async function WatchTVShowPage({params}: Props) {
    //@ts-ignore
    const [tvDetails, videosData] = await Promise.all([getTVShowDetails(params.id), getTVShowVideos(params.id)])

    const videos = videosData.results || []
    const trailer = videos.find((video: any) => video.type === "Trailer" && video.site === "YouTube") || videos[0]

    const trailerKey = trailer?.key || ""

    return (
        <>
            <MediaPlayer
                //@ts-ignore
                mediaId={params.id}
                mediaType="tv"
                title={tvDetails.name}
                //@ts-ignore
                backUrl={`/tv/${params.id}`}
                youtubeTrailerId={trailerKey}
            />
        </>
    )
}
