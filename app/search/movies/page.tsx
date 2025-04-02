import { SiteHeader } from "@/components/site-header"
import { MovieCard } from "@/components/movie-card"
import { searchMovies } from "@/lib/tmdb"
import { Pagination } from "@/components/ui/pagination"
import type { Metadata } from "next"

interface SearchMoviesPageProps {
  searchParams: {
    query?: string
    page?: string
  }
}

export async function generateMetadata({ searchParams }: SearchMoviesPageProps): Promise<Metadata> {
  const query = searchParams.query || ""

  return {
    title: `Movie results for "${query}" | BeatWig`,
    description: `Find movies related to "${query}". Browse results and discover new content.`,
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function SearchMoviesPage({ searchParams }: SearchMoviesPageProps) {
  const query = searchParams.query || ""
  const page = Number.parseInt(searchParams.page || "1")

  // If no query, redirect to main search page
  if (!query) {
    return (
      <>
        <SiteHeader />
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Search for Movies</h1>
          <p className="text-muted-foreground">Enter a search term in the search box above to find movies.</p>
        </div>
      </>
    )
  }

  // Fetch search results
  const moviesData = await searchMovies(query, page).catch(() => ({ results: [], total_pages: 0, total_results: 0 }))

  const movies = moviesData.results || []
  const totalPages = moviesData.total_pages || 0
  const totalResults = moviesData.total_results || 0

  return (
    <>
      <SiteHeader />

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">Movie results for "{query}"</h1>
        <p className="text-muted-foreground mb-8">Found {totalResults} movies</p>

        {movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {movies.map((movie) => (
                <MovieCard key={movie.id} media={movie} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={`/search/movies?query=${encodeURIComponent(query)}&page=`}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No movies found</h2>
            <p className="text-muted-foreground">
              We couldn't find any movies matching "{query}".
              <br />
              Try a different search term or check your spelling.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

