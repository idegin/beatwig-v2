"use client"

import { PageSection } from "@/components/page-section"
import { ContinueWatching } from "@/components/home/continue-watching"
import { GenreRow } from "@/components/home/genre-row"
import { FilmRow } from "@/components/film-row"
import { ContinueWatchingItem } from "@/types/firebase.types"
import { Film, Genre } from "@/types/tmdb.types"

interface ForYouContentProps {
  genres: Genre[]
  continueWatch: ContinueWatchingItem[]
  becauseYouWatched: {
    title: string
    films: Film[]
  }
}

export function ForYouContent({
  genres,
  continueWatch,
  becauseYouWatched,
}: ForYouContentProps) {
  return (
    <div className="space-y-2 md:space-y-4">
      <PageSection
        heading="Continue Watching"
        subHeading="Pick up where you left off"
        altLink={{ route: "/history", text: "View History" }}
      >
        <ContinueWatching items={continueWatch} />
      </PageSection>

      <PageSection
        heading={`Because You Watched "${becauseYouWatched.title}"`}
        subHeading="Personalized recommendations for you"
      >
        <FilmRow films={becauseYouWatched.films} />
      </PageSection>

      <PageSection
        heading="Browse by Genre"
        subHeading="Find something that matches your mood"
        altLink={{ route: "/genres", text: "All Genres" }}
      >
        <GenreRow genres={genres} />
      </PageSection>
    </div>
  )
}
