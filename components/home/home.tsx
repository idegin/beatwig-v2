"use client"

import { PageSection } from "@/components/page-section"
import { ContinueWatching } from "./continue-watching"
import { FilmRow } from "@/components/film-row"
import { GenreRow } from "./genre-row"
import { PeopleRow } from "./people-row"
import { Top10Row } from "./top-10-row"
import { RecommendationBanner } from "./recommendation-banner"
import { ContinueWatchingItem } from "@/types/firebase.types"
import { Film, Genre, HeroData, Person } from "@/types/tmdb.types"
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
    heroData: HeroData
    popularPeople?: Person[]
    showRecommendationBanner?: boolean
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
    popularPeople,
    showRecommendationBanner = false,
}: HomeProps) {
    return (
        <div className="space-y-2 md:space-y-4">
            {showRecommendationBanner && <RecommendationBanner />}
            
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
                altLink={{ route: "/genre/10749?type=movie", text: "View All" }}
            >
                <FilmRow films={romanceMovies} />
            </PageSection>

            <PageSection
                heading="Action Movies"
                subHeading="Non-stop thrills and excitement"
                altLink={{ route: "/genre/28?type=movie", text: "View All" }}
            >
                <FilmRow films={actionMovies} />
            </PageSection>

            <PageSection
                heading={`Top 10 on ${appData.name}`}
                subHeading="The most popular titles right now"
                altLink={{ route: "/popular", text: "View All" }}
            >
                <Top10Row films={popularOnApp} />
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