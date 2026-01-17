"use client"

import { PageSection } from "@/components/page-section"
import { FilmRow } from "@/components/film-row"
import { GenreRow } from "./genre-row"
import { ThemeRow } from "./theme-row"
import { PeopleRow } from "./people-row"
import { Top10Row } from "./top-10-row"
import { RecommendationBanner } from "./recommendation-banner"
import { Film, Genre, Person } from "@/types/tmdb.types"
import { appData } from "@/app/constants"

interface GenreSection {
    id: number
    name: string
    films: Film[]
}

interface HomeProps {
    nowShowingInTheaters: Film[]
    upcomingMovies: Film[]
    genres: Genre[]
    popularPeople?: Person[]
    showRecommendationBanner?: boolean
    popularOnBeatWig?: Film[]
    hotThemes?: { name: string; userCount: number }[]
    communityFavorites?: Film[]
    whatPeopleWatching?: Film[]
    top10OnApp?: Film[]
    randomGenreSections?: GenreSection[]
}

export default function Home({
    nowShowingInTheaters,
    upcomingMovies,
    genres,
    popularPeople,
    showRecommendationBanner = false,
    popularOnBeatWig = [],
    hotThemes = [],
    communityFavorites = [],
    whatPeopleWatching = [],
    top10OnApp = [],
    randomGenreSections = [],
}: HomeProps) {
    return (
        <div className="space-y-2 md:space-y-4">
            {showRecommendationBanner && <RecommendationBanner />}

            {whatPeopleWatching.length > 0 && (
                <PageSection
                    heading="What People Are Watching"
                    subHeading="Trending on BeatWig right now"
                >
                    <FilmRow films={whatPeopleWatching} variant="wide" />
                </PageSection>
            )}

            <PageSection
                heading="Now Showing in Theaters"
                subHeading="Catch the latest blockbusters"
                altLink={{ route: "/movies", text: "View All" }}
            >
                <FilmRow films={nowShowingInTheaters} variant="wide" />
            </PageSection>

            {popularOnBeatWig.length > 0 && (
                <PageSection
                    heading={`Popular on ${appData.name}`}
                    subHeading="Most watched by our community"
                >
                    <FilmRow films={popularOnBeatWig} />
                </PageSection>
            )}

            <PageSection
                heading="Upcoming Movies"
                subHeading="Coming soon to theaters"
                altLink={{ route: "/movies", text: "View All" }}
            >
                <FilmRow films={upcomingMovies} />
            </PageSection>

            {hotThemes.length > 0 && (
                <PageSection
                    heading="Hot Themes This Week"
                    subHeading="Trending topics our users love"
                >
                    <ThemeRow themes={hotThemes} />
                </PageSection>
            )}

            {randomGenreSections.length > 0 && randomGenreSections[0] && (
                <PageSection
                    heading={`${randomGenreSections[0].name} Movies`}
                    subHeading={`Explore ${randomGenreSections[0].name.toLowerCase()} titles`}
                    altLink={{ route: `/genre/${randomGenreSections[0].id}?type=movie`, text: "View All" }}
                >
                    <FilmRow films={randomGenreSections[0].films} />
                </PageSection>
            )}

            {popularPeople && popularPeople.length > 0 && (
                <PageSection
                    heading="Popular People"
                    subHeading="Trending actors, directors & more"
                    altLink={{ route: "/people", text: "View All" }}
                >
                    <PeopleRow people={popularPeople} />
                </PageSection>
            )}

            {communityFavorites.length > 0 && (
                <PageSection
                    heading="Community Favorites"
                    subHeading="Most saved to watchlists"
                >
                    <FilmRow films={communityFavorites} />
                </PageSection>
            )}

            {randomGenreSections.length > 1 && randomGenreSections[1] && (
                <PageSection
                    heading={`${randomGenreSections[1].name} Movies`}
                    subHeading={`Explore ${randomGenreSections[1].name.toLowerCase()} titles`}
                    altLink={{ route: `/genre/${randomGenreSections[1].id}?type=movie`, text: "View All" }}
                >
                    <FilmRow films={randomGenreSections[1].films} />
                </PageSection>
            )}

            {top10OnApp.length > 0 && (
                <PageSection
                    heading={`Top 10 on ${appData.name}`}
                    subHeading="The most popular titles right now"
                >
                    <Top10Row films={top10OnApp} />
                </PageSection>
            )}

            {randomGenreSections.length > 2 && randomGenreSections[2] && (
                <PageSection
                    heading={`${randomGenreSections[2].name} Movies`}
                    subHeading={`Explore ${randomGenreSections[2].name.toLowerCase()} titles`}
                    altLink={{ route: `/genre/${randomGenreSections[2].id}?type=movie`, text: "View All" }}
                >
                    <FilmRow films={randomGenreSections[2].films} />
                </PageSection>
            )}

            <PageSection
                heading="Browse by Genre"
                subHeading="Find something that matches your mood"
            >
                <GenreRow genres={genres} />
            </PageSection>
        </div>
    )
}