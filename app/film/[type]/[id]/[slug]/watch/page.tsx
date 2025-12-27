import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getFilmDetails } from "@/lib/tmdb"
import { WatchFilm } from "./components/watch-film"

interface WatchPageProps {
  params: Promise<{
    type: string
    id: string
    slug: string
  }>
  searchParams: Promise<{
    season?: string
    episode?: string
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

export async function generateMetadata({ params, searchParams }: WatchPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { type, id, slug } = resolvedParams
  const filmId = parseInt(id)

  if (isNaN(filmId) || !["movie", "tv"].includes(type)) {
    return { title: "Not Found | BeatWig" }
  }

  const data = await getFilmDetails(filmId, type as "movie" | "tv")

  if (!data) {
    return { title: "Not Found | BeatWig" }
  }

  const title = data.title
  const isTV = type === "tv"
  const season = resolvedSearchParams.season || "1"
  const episode = resolvedSearchParams.episode || "1"

  const pageTitle = isTV
    ? `Watch ${title} S${season}E${episode} | BeatWig`
    : `Watch ${title} | BeatWig`

  const description = isTV
    ? `Stream ${title} Season ${season} Episode ${episode} online for free on BeatWig.`
    : `Stream ${title} online for free on BeatWig.`

  const posterUrl = data.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
    : data.poster_path
    ? `https://image.tmdb.org/t/p/w780${data.poster_path}`
    : undefined

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      type: "video.movie",
      siteName: "BeatWig",
      images: posterUrl ? [{ url: posterUrl, width: 1280, height: 720 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: posterUrl ? [posterUrl] : [],
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { type, id, slug } = resolvedParams
  const filmId = parseInt(id)

  if (isNaN(filmId) || !["movie", "tv"].includes(type)) {
    notFound()
  }

  const data = await getFilmDetails(filmId, type as "movie" | "tv")

  if (!data) {
    notFound()
  }

  const expectedSlug = slugify(data.title)
  if (slug !== expectedSlug) {
    notFound()
  }

  const initialSeason = parseInt(resolvedSearchParams.season || "1")
  const initialEpisode = parseInt(resolvedSearchParams.episode || "1")

  return (
    <WatchFilm
      data={data}
      mediaType={type as "movie" | "tv"}
      filmId={filmId}
      slug={slug}
      initialSeason={initialSeason}
      initialEpisode={initialEpisode}
    />
  )
}
