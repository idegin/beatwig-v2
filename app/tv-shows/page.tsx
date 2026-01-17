import { loadTvShows, getTVGenres } from "@/lib/tmdb"
import { HomeHero } from "@/components/home/home-hero"
import { PageSection } from "@/components/page-section"
import { FilmGridSection } from "@/components/film-grid-section"
import { GenreRow } from "@/components/home/genre-row"

export default async function TvShowsPage() {
  const [{ heroData, genreSections }, genresData] = await Promise.all([
    loadTvShows(),
    getTVGenres()
  ])

  return (
    <div className="min-h-screen">
      {heroData && <HomeHero data={heroData} />}

      <div className="container mx-auto px-4 py-8 md:py-12 space-y-10 md:space-y-16">
        {genreSections.map((section) => (
          <PageSection
            key={section.genreId}
            heading={section.genreName}
            subHeading={`Popular ${section.genreName.toLowerCase()} TV shows`}
            altLink={{
              route: `/genre/${section.genreId}?type=tv`,
              text: "View All",
            }}
          >
            <FilmGridSection films={section.films} maxItems={12} />
          </PageSection>
        ))}

        {genreSections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground">
              No TV shows available at the moment
            </p>
          </div>
        )}

        {genresData.genres.length > 0 && (
          <PageSection
            heading="Browse by Genre"
            subHeading="Explore TV shows by category"
          >
            <GenreRow genres={genresData.genres} />
          </PageSection>
        )}
      </div>
    </div>
  )
}
