import { SiteHeader } from "@/components/site-header"
import { MediaDetails } from "@/components/media-details/media-details"
import { getTVShowDetails } from "@/lib/tmdb"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  //@ts-ignore
  const tvDetails = await getTVShowDetails(params.id)

  return {
    title: `${tvDetails.name} | BeatWig`,
    description: tvDetails.overview,
    openGraph: {
      images: [
        {
          url: `https://image.tmdb.org/t/p/w1280${tvDetails.backdrop_path}`,
          width: 1280,
          height: 720,
          alt: tvDetails.name,
        },
      ],
    },
  }
}

export default async function TVPage({ params }: Props) {
  //@ts-ignore
  const tvDetails = await getTVShowDetails(params.id)

  return (
    <>
      <SiteHeader />
      <MediaDetails data={tvDetails} type="tv" />
    </>
  )
}

