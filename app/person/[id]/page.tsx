"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { FilmCard } from "@/components/cards/film-card"
import { Film } from "@/types/tmdb.types"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Film as FilmIcon, Tv, Cake, MapPin, User, Star, Loader2 } from "lucide-react"
import { TMDB_IMAGE_BASE } from "@/app/constants"

interface PersonData {
  id: number
  name: string
  biography: string
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  profile_path: string | null
  known_for_department: string
  popularity: number
  credits: Film[]
  totalCredits: number
}

function PersonHeroSkeleton() {
  return (
    <div className="relative w-full overflow-hidden bg-muted/30">
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Skeleton className="w-48 md:w-64 aspect-2/3 rounded-2xl shrink-0 mx-auto md:mx-0" />
          <div className="flex-1 space-y-4 w-full">
            <Skeleton className="h-12 w-80 max-w-full mx-auto md:mx-0" />
            <Skeleton className="h-6 w-40 mx-auto md:mx-0" />
            <div className="flex gap-4 justify-center md:justify-start">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
            <Skeleton className="h-24 w-full max-w-2xl" />
            <div className="flex gap-3 pt-4 justify-center md:justify-start">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </div>
  )
}

function FilmGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-2/3 rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export default function PersonDetailsPage() {
  const params = useParams()
  const personId = params.id as string
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all")
  const [personData, setPersonData] = useState<PersonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [displayedFilms, setDisplayedFilms] = useState<Film[]>([])
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<HTMLDivElement>(null)
  const itemsPerPage = 18

  useEffect(() => {
    const fetchPersonData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/public/person/${personId}`)
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        setPersonData(data)
        
        const filtered = filterFilms(data.credits, mediaType)
        setDisplayedFilms(filtered.slice(0, itemsPerPage))
        setHasMore(filtered.length > itemsPerPage)
      } catch (error) {
        console.error("Error fetching person:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPersonData()
  }, [personId])

  const filterFilms = (credits: Film[], type: "all" | "movie" | "tv") => {
    if (type === "all") return credits
    return credits.filter(f => f.media_type === type)
  }

  useEffect(() => {
    if (!personData) return
    const filtered = filterFilms(personData.credits, mediaType)
    setDisplayedFilms(filtered.slice(0, itemsPerPage))
    setHasMore(filtered.length > itemsPerPage)
  }, [mediaType, personData])

  const loadMore = useCallback(() => {
    if (!personData || loadingMore || !hasMore) return
    
    setLoadingMore(true)
    const filtered = filterFilms(personData.credits, mediaType)
    const currentLength = displayedFilms.length
    const nextFilms = filtered.slice(currentLength, currentLength + itemsPerPage)
    
    setTimeout(() => {
      setDisplayedFilms(prev => [...prev, ...nextFilms])
      setHasMore(currentLength + nextFilms.length < filtered.length)
      setLoadingMore(false)
    }, 500)
  }, [personData, mediaType, displayedFilms.length, loadingMore, hasMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore, hasMore, loadingMore])

  const calculateAge = (birthday: string, deathday?: string | null) => {
    const birth = new Date(birthday)
    const end = deathday ? new Date(deathday) : new Date()
    let age = end.getFullYear() - birth.getFullYear()
    const monthDiff = end.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <PersonHeroSkeleton />
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Skeleton className="h-8 w-48 mb-6" />
          <FilmGridSkeleton />
        </div>
      </div>
    )
  }

  if (!personData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="size-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Person not found</h1>
        </div>
      </div>
    )
  }

  const profileUrl = personData.profile_path
    ? `${TMDB_IMAGE_BASE}/w500${personData.profile_path}`
    : null

  const age = personData.birthday 
    ? calculateAge(personData.birthday, personData.deathday) 
    : null

  const filtered = filterFilms(personData.credits, mediaType)
  const movieCount = personData.credits.filter(f => f.media_type === "movie").length
  const tvCount = personData.credits.filter(f => f.media_type === "tv").length

  return (
    <div className="min-h-screen">
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-secondary/10 to-background" />
        
        {profileUrl && (
          <>
            <div className="absolute inset-0 opacity-20">
              <img
                src={profileUrl}
                alt=""
                className="w-full h-full object-cover blur-3xl scale-110"
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-b from-background/40 via-background/60 to-background" />
          </>
        )}

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-48 md:w-64 shrink-0 mx-auto md:mx-0">
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt={personData.name}
                  className="w-full aspect-2/3 object-cover rounded-2xl shadow-2xl border-2 border-white/10"
                />
              ) : (
                <div className="w-full aspect-2/3 rounded-2xl bg-muted flex items-center justify-center">
                  <User className="size-20 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground drop-shadow-2xl mb-2">
                {personData.name}
              </h1>
              
              <div className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {personData.known_for_department}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="size-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{personData.popularity.toFixed(0)} popularity</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                {age && (
                  <div className="flex items-center gap-2 bg-white/10 dark:bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                    <Cake className="size-4 text-primary" />
                    <span>{personData.deathday ? `Lived ${age} years` : `${age} years old`}</span>
                  </div>
                )}
                {personData.place_of_birth && (
                  <div className="flex items-center gap-2 bg-white/10 dark:bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                    <MapPin className="size-4 text-primary" />
                    <span>{personData.place_of_birth}</span>
                  </div>
                )}
              </div>

              {personData.biography && (
                <p className="text-muted-foreground max-w-2xl line-clamp-4 mb-6">
                  {personData.biography}
                </p>
              )}

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Button
                  variant={mediaType === "all" ? "default" : "outline"}
                  onClick={() => setMediaType("all")}
                  size="sm"
                >
                  All ({personData.totalCredits})
                </Button>
                <Button
                  variant={mediaType === "movie" ? "default" : "outline"}
                  onClick={() => setMediaType("movie")}
                  className="gap-2"
                  size="sm"
                >
                  <FilmIcon className="size-4" />
                  Movies ({movieCount})
                </Button>
                <Button
                  variant={mediaType === "tv" ? "default" : "outline"}
                  onClick={() => setMediaType("tv")}
                  className="gap-2"
                  size="sm"
                >
                  <Tv className="size-4" />
                  TV Shows ({tvCount})
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <h2 className="text-2xl font-bold mb-6">
          Filmography 
          <span className="text-muted-foreground font-normal ml-2">({filtered.length} titles)</span>
        </h2>

        {displayedFilms.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {displayedFilms.map((film, index) => (
                <FilmCard key={`${film.id}-${film.media_type}-${index}`} film={film} />
              ))}
            </div>

            {hasMore && (
              <div ref={observerRef} className="flex justify-center py-12">
                {loadingMore && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                    <span>Loading more...</span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <FilmIcon className="size-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No {mediaType === "all" ? "" : mediaType} credits found</p>
          </div>
        )}
      </div>
    </div>
  )
}
