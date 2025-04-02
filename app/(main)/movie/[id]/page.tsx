import { SiteHeader } from "@/components/site-header"
import { MediaDetails } from "@/components/media-details"
import { getMovieDetails } from "@/lib/tmdb"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  //@ts-ignore
  const movieDetails = await getMovieDetails(params.id)

  return {
    title: `${movieDetails.title} | BeatWig`,
    description: movieDetails.overview,
    openGraph: {
      images: [
        {
          url: `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}`,
          width: 1280,
          height: 720,
          alt: movieDetails.title,
        },
      ],
    },
  }
}

export default async function MoviePage({ params }: Props) {
  //@ts-ignore
  const movieDetails = await getMovieDetails(params.id)

  return (
      <>
        <SiteHeader />
        <MediaDetails data={movieDetails} type="movie" />
      </>
  )
}
