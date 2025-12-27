import FilmDetails from "@/app/film/components/film-details"
import { getFilmDetails } from "@/lib/tmdb"

interface FilmDetailsPageProps {
  params: Promise<{
    type: string
    id: string
    slug: string
  }>
}

export default async function FilmDetailsPage({ params }: FilmDetailsPageProps) {
  const { type, id } = await params
  const mediaType = type === "tv" ? "tv" : "movie"
  const data = await getFilmDetails(parseInt(id), mediaType)

  return (
    <FilmDetails
      data={data}
      mediaType={mediaType}
    />
  )
}