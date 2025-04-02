import { getMovieDetails, getMovieVideos } from "@/lib/tmdb"
import { MediaPlayer } from "@/components/media-player"
import type { Metadata } from "next"

interface WatchPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
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

export default async function WatchPage({ params }: WatchPageProps) {
  // Fetch movie details and videos in parallel
  const [movieDetails, videosData] = await Promise.all([getMovieDetails(params.id), getMovieVideos(params.id)])

  // Find a trailer
  const videos = videosData.results || []
  const trailer = videos.find((video: any) => video.type === "Trailer" && video.site === "YouTube") || videos[0]

  const trailerKey = trailer?.key || ""

  return (
    <MediaPlayer
      mediaId={params.id}
      mediaType="movie"
      title={movieDetails.title}
      backUrl={`/movie/${params.id}`}
      youtubeTrailerId={trailerKey}
    />
  )
}

