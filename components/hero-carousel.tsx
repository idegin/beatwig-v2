"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {getTMDBImageUrl, formatDate, truncateText, isMovie, getMediaTitle, getMediaDate, cn} from "@/lib/utils"
import { BACKDROP_SIZES, POSTER_SIZES } from "@/lib/constants"
import type { Movie, TVShow } from "@/lib/tmdb"
import { Play, Plus, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { VideoPopup } from "@/components/video-popup"

interface HeroCarouselProps {
  items: (Movie | TVShow)[]
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)
  const [trailerKey, setTrailerKey] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext()
    }, 8000)

    return () => clearInterval(interval)
  }, [currentIndex])

  const goToPrevious = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1))

    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }

  const goToNext = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1))

    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return

    setIsTransitioning(true)
    setCurrentIndex(index)

    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }

  if (!items || items.length === 0) return null

  const currentItem = items[currentIndex]
  const title = getMediaTitle(currentItem)
  const releaseDate = getMediaDate(currentItem)
  const type = isMovie(currentItem) ? "movie" : "tv"
  const detailsLink = `/${type}/${currentItem.id}`
  const watchLink = `/${type}/${currentItem.id}/watch`

  const getBackgroundImage = (item:any) => {
    return item.backdrop_path
      ? getTMDBImageUrl(item.backdrop_path, BACKDROP_SIZES.ORIGINAL)
      : item.poster_path
        ? getTMDBImageUrl(item.poster_path, POSTER_SIZES.ORIGINAL)
        : "/placeholder.svg?height=720&width=1280"
  }

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden flex justify-center">
      <div className="absolute inset-0 transition-opacity duration-500 ease-in-out">
        {
          items.map((item: (Movie | TVShow), index) => (
            <Image
              key={item.id}
              src={getBackgroundImage(item)}
              alt={getMediaTitle(item)}
              fill
              priority
              className={cn("object-cover", {
                "opacity-0": currentIndex !== index,
                "opacity-100": currentIndex === index,
                "transition-opacity duration-500 ease-in-out": true,
              })}
            />
          ))
        }
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
      </div>

      <div className="container relative h-full flex flex-col justify-end pb-16 pt-32">
        <div className="max-w-2xl animate-fade-in">
          <Badge className="mb-4 bg-primary/90 hover:bg-primary">
            {type === "movie" ? "Featured Movie" : "Featured TV Show"}
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold animate-slide-up">
            <Link href={detailsLink} className="hover:text-primary transition-colors">
              {title}
            </Link>
          </h1>

          <div className="mt-4 flex items-center gap-3 text-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{currentItem.vote_average.toFixed(1)}</span>
            </div>
            <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground" />
            <span>{formatDate(releaseDate)}</span>
            <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground" />
            <span>{type === "movie" ? "Movie" : "TV Series"}</span>
          </div>

          <p className="mt-6 text-lg text-muted-foreground">{truncateText(currentItem.overview, 200)}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              size="lg"
              className="gap-2 rounded-full"
              onClick={() => {
                // Open trailer popup
                setTrailerKey("") // This will be fetched in the details page
                setShowTrailer(true)
              }}
            >
              <Play className="h-5 w-5" />
              Watch Trailer
            </Button>

            <Button variant="outline" size="lg" className="gap-2 rounded-full" asChild>
              <Link href={detailsLink}>
                <Plus className="h-5 w-5" />
                Add To Watchlist
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-12 w-12"
        onClick={goToPrevious}
        disabled={isTransitioning}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Previous</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-12 w-12"
        onClick={goToNext}
        disabled={isTransitioning}
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Next</span>
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all duration-500 ${
              index === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/50"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Trailer Popup */}
      {showTrailer && (
        <VideoPopup
          videoId={trailerKey}
          title={`${title} - Trailer`}
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
          mediaId={currentItem.id.toString()}
          mediaType={type}
        />
      )}
    </section>
  )
}

