import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getTMDBImageUrl, formatDate, truncateText, isMovie, getMediaTitle, getMediaDate } from "@/lib/utils"
import { BACKDROP_SIZES } from "@/lib/constants"
import type { Movie, TVShow } from "@/lib/tmdb"
import { Play, Plus, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface HeroSectionProps {
  media: Movie | TVShow
}

export function HeroSection({ media }: HeroSectionProps) {
  const title = getMediaTitle(media)
  const releaseDate = getMediaDate(media)
  const type = isMovie(media) ? "movie" : "tv"
  const detailsLink = `/${type}/${media.id}`

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={getTMDBImageUrl(media.backdrop_path, BACKDROP_SIZES.ORIGINAL) || "/placeholder.svg"}
          alt={title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative h-full flex flex-col justify-end pb-16 pt-32">
        <div className="max-w-2xl animate-fade-in">
          <Badge className="mb-4 bg-primary/90 hover:bg-primary">
            {type === "movie" ? "Featured Movie" : "Featured TV Show"}
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold animate-slide-up">{title}</h1>

          <div className="mt-4 flex items-center gap-3 text-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{media.vote_average.toFixed(1)}</span>
            </div>
            <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground" />
            <span>{formatDate(releaseDate)}</span>
            <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground" />
            <span>{type === "movie" ? "Movie" : "TV Series"}</span>
          </div>

          <p className="mt-6 text-lg text-muted-foreground">{truncateText(media.overview, 200)}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" className="gap-2 rounded-full">
              <Link href={detailsLink}>
                <Play className="h-5 w-5" />
                Watch Trailer
              </Link>
            </Button>

            <Button variant="outline" size="lg" className="gap-2 rounded-full">
              <Plus className="h-5 w-5" />
              Add to Watchlist
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

