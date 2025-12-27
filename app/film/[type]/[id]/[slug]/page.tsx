import { Metadata } from "next"
import { notFound } from "next/navigation"
import FilmDetails from "@/app/film/components/film-details"
import { getFilmDetails } from "@/lib/tmdb"

interface FilmDetailsPageProps {
  params: Promise<{
    type: string
    id: string
    slug: string
  }>
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

export async function generateMetadata({ params }: FilmDetailsPageProps): Promise<Metadata> {
  const { type, id, slug } = await params
  const filmId = parseInt(id)

  if (isNaN(filmId) || !["movie", "tv"].includes(type)) {
    return { title: "Not Found | BeatWig" }
  }

  const mediaType = type === "tv" ? "tv" : "movie"
  const data = await getFilmDetails(filmId, mediaType)

  if (!data) {
    return { title: "Not Found | BeatWig" }
  }

  const title = data.title
  const year = data.release_date ? ` (${data.release_date.split("-")[0]})` : ""
  const genres = data.genres?.slice(0, 3).join(", ") || ""
  const rating = data.vote_average ? `★ ${data.vote_average.toFixed(1)}` : ""

  const pageTitle = `${title}${year} | BeatWig`

  const descriptionParts = [
    data.overview?.slice(0, 160) || `Watch ${title} on BeatWig.`,
  ]
  if (genres) descriptionParts.push(`Genres: ${genres}.`)
  if (rating) descriptionParts.push(`Rating: ${rating}.`)

  const description = descriptionParts.join(" ")

  const posterUrl = data.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
    : data.poster_path
    ? `https://image.tmdb.org/t/p/w780${data.poster_path}`
    : undefined

  const keywords = [
    title,
    `watch ${title}`,
    `stream ${title}`,
    `${title} online`,
    type === "tv" ? "TV show" : "movie",
    ...data.genres,
  ].filter(Boolean)

  return {
    title: pageTitle,
    description,
    keywords,
    openGraph: {
      title: pageTitle,
      description,
      type: type === "tv" ? "video.tv_show" : "video.movie",
      siteName: "BeatWig",
      images: posterUrl
        ? [
            {
              url: posterUrl,
              width: 1280,
              height: 720,
              alt: `${title} poster`,
            },
          ]
        : [],
      releaseDate: data.release_date,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: posterUrl ? [posterUrl] : [],
    },
    alternates: {
      canonical: `/film/${type}/${id}/${slug}`,
    },
    ...(data.runtime && {
      other: {
        "og:video:duration": String(data.runtime * 60),
      },
    }),
  }
}

export default async function FilmDetailsPage({ params }: FilmDetailsPageProps) {
  const { type, id, slug } = await params
  const filmId = parseInt(id)

  if (isNaN(filmId) || !["movie", "tv"].includes(type)) {
    notFound()
  }

  const mediaType = type === "tv" ? "tv" : "movie"
  const data = await getFilmDetails(filmId, mediaType)

  if (!data) {
    notFound()
  }

  const expectedSlug = slugify(data.title)
  if (slug !== expectedSlug) {
    notFound()
  }

  return (
    <FilmDetails
      data={data}
      mediaType={mediaType}
    />
  )
}