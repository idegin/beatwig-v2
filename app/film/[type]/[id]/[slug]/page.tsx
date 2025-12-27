"use client"

import { notFound } from "next/navigation"

interface FilmDetailsPageProps {
  params: {
    type: string
    id: string
    slug: string
  }
}

export default function FilmDetailsPage({ params }: FilmDetailsPageProps) {
  // Hardcoded sample data
  const filmData = {
    title: params.type === "movie" ? "The Dark Knight" : "Stranger Things",
    overview: params.type === "movie" 
      ? "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."
      : "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    poster_path: params.type === "movie" 
      ? "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
      : "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop_path: params.type === "movie"
      ? "https://image.tmdb.org/t/p/original/hqkIcbrOHL86UncnHIsHVcVmzue.jpg"
      : "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    release_date: params.type === "movie" ? "2008-07-18" : "2016-07-15",
    vote_average: params.type === "movie" ? 9.0 : 8.7,
    genres: params.type === "movie" ? ["Action", "Crime", "Drama"] : ["Drama", "Fantasy", "Horror"],
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={filmData.backdrop_path}
          alt={filmData.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3 flex-shrink-0">
            <img
              src={filmData.poster_path}
              alt={filmData.title}
              className="w-full max-w-sm mx-auto lg:mx-0 rounded-lg shadow-2xl"
            />
          </div>

          <div className="lg:w-2/3">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {filmData.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="text-lg font-medium text-muted-foreground">
                {params.type === "movie" ? "Movie" : "TV Show"}
              </span>
              <span className="text-lg text-muted-foreground">•</span>
              <span className="text-lg text-muted-foreground">
                {new Date(filmData.release_date).getFullYear()}
              </span>
              <span className="text-lg text-muted-foreground">•</span>
              <span className="text-lg font-medium text-yellow-500">
                ⭐ {filmData.vote_average}
              </span>
            </div>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {filmData.overview}
            </p>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-xl font-semibold">
                <span>Coming Soon</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-semibold text-foreground min-w-[120px]">Release Date:</span>
                <span className="text-muted-foreground">{new Date(filmData.release_date).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-semibold text-foreground min-w-[120px]">Genres:</span>
                <div className="flex flex-wrap gap-2">
                  {filmData.genres.map((genre) => (
                    <span key={genre} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}