"use client"

import { PageSection } from "@/components/page-section"
import { ContinueWatching } from "./continue-watching"
import { FilmRow } from "@/components/film-row"
import { GenreRow } from "./genre-row"
import { NetworkRow } from "./network-row"
import { PeopleRow } from "./people-row"
import { ContinueWatchingItem } from "@/types/firebase.types"
import { Film, Genre, HeroData, Network, Person } from "@/types/tmdb.types"
import { appData } from "@/app/constants"

interface HomeProps {
    continueWatch: ContinueWatchingItem[]
    becauseYouWatched: {
        title: string
        films: Film[]
    }
    nowShowingInTheaters: Film[]
    upcomingMovies: Film[]
    romanceMovies: Film[]
    actionMovies: Film[]
    popularOnApp: Film[]
    genres: Genre[]
    networks: Network[]
    heroData: HeroData
    popularPeople?: Person[]
}

export default function Home({
    continueWatch,
    becauseYouWatched,
    nowShowingInTheaters,
    upcomingMovies,
    romanceMovies,
    actionMovies,
    popularOnApp,
    genres,
    networks,
    popularPeople,
}: HomeProps) {
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
                heading="Now Showing in Theaters"
                subHeading="Catch the latest blockbusters"
                altLink={{ route: "/movies/now-playing", text: "View All" }}
            >
                <FilmRow films={nowShowingInTheaters} variant="wide" />
            </PageSection>

            <PageSection
                heading="Upcoming Movies"
                subHeading="Coming soon to theaters"
                altLink={{ route: "/movies/upcoming", text: "View All" }}
            >
                <FilmRow films={upcomingMovies} />
            </PageSection>

            {popularPeople && popularPeople.length > 0 && (
                <PageSection
                    heading="Popular People"
                    subHeading="Trending actors, directors & more"
                    altLink={{ route: "/people", text: "View All" }}
                >
                    <PeopleRow people={popularPeople} />
                </PageSection>
            )}

            <PageSection
                heading="Romance Movies"
                subHeading="Fall in love with these picks"
                altLink={{ route: "/genres/10749", text: "View All" }}
            >
                <FilmRow films={romanceMovies} />
            </PageSection>

            <PageSection
                heading="Action Movies"
                subHeading="Non-stop thrills and excitement"
                altLink={{ route: "/genres/28", text: "View All" }}
            >
                <FilmRow films={actionMovies} />
            </PageSection>

            <PageSection
                heading={`Popular on ${appData.name}`}
                subHeading="What everyone's watching right now"
                altLink={{ route: "/popular", text: "View All" }}
            >
                <FilmRow films={popularOnApp} variant="compact" />
            </PageSection>

            <PageSection
                heading="Browse by Network"
                subHeading="Explore content from top streaming networks"
                altLink={{ route: "/networks", text: "All Networks" }}
            >
                <NetworkRow networks={networks} />
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