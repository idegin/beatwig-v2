import { getTVShowDetails, getTVShowVideos } from "@/lib/tmdb"
import { MediaPlayer } from "@/components/media-player"
import type { Metadata } from "next"

interface WatchPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
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

export default async function WatchPage({ params }: WatchPageProps) {
  // Fetch TV details and videos in parallel
  const [tvDetails, videosData] = await Promise.all([getTVShowDetails(params.id), getTVShowVideos(params.id)])

  // Find a trailer
  const videos = videosData.results || []
  const trailer = videos.find((video: any) => video.type === "Trailer" && video.site === "YouTube") || videos[0]

  const trailerKey = trailer?.key || ""

  return (
    <MediaPlayer
      mediaId={params.id}
      mediaType="tv"
      title={tvDetails.name}
      backUrl={`/tv/${params.id}`}
      youtubeTrailerId={trailerKey}
    />
  )
}

