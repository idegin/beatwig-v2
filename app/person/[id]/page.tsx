import { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { getPersonDetails, getPersonMovieCredits, getPersonTVCredits } from "@/lib/tmdb"
import { PersonHero } from "@/components/person-hero"
import { PersonContent } from "@/components/person-content"
import { SITE_NAME } from "@/lib/constants"

interface PersonPageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
    try {
        const { id: personId } = await params
        const person = await getPersonDetails(personId)

        return {
            title: `${person.name} - Actor/Actress | ${SITE_NAME}`,
            description: person.biography ? 
                `${person.biography.slice(0, 160)}...` : 
                `Learn about ${person.name}, ${person.known_for_department.toLowerCase()} known for their work in movies and TV shows.`,
            keywords: [person.name, "actor", "actress", "movies", "tv shows", "filmography", person.known_for_department],
            openGraph: {
                title: `${person.name} - Actor/Actress | ${SITE_NAME}`,
                description: person.biography ? 
                    `${person.biography.slice(0, 160)}...` : 
                    `Learn about ${person.name}, ${person.known_for_department.toLowerCase()}.`,
                url: `https://beatwig.site/person/${personId}`,
                siteName: SITE_NAME,
                type: "profile",
                images: person.profile_path ? [
                    {
                        url: `https://image.tmdb.org/t/p/w500${person.profile_path}`,
                        width: 500,
                        height: 750,
                        alt: person.name,
                    },
                ] : undefined,
            },
            twitter: {
                card: "summary_large_image",
                title: `${person.name} - Actor/Actress | ${SITE_NAME}`,
                description: person.biography ? 
                    `${person.biography.slice(0, 160)}...` : 
                    `Learn about ${person.name}, ${person.known_for_department.toLowerCase()}.`,
            },
        }
    } catch (error) {
        return {
            title: "Person Not Found | BeatWig",
            description: "The person you're looking for could not be found.",
        }
    }
}

export default async function PersonPage({ params }: PersonPageProps) {
    try {
        const { id: personId } = await params

        const [person, movieCredits, tvCredits] = await Promise.all([
            getPersonDetails(personId),
            getPersonMovieCredits(personId).catch(() => ({ cast: [], crew: [] })),
            getPersonTVCredits(personId).catch(() => ({ cast: [], crew: [] })),
        ])

        return (
            <>
                <SiteHeader />
                <PersonHero person={person} />
                <PersonContent 
                    person={person}
                    movieCredits={movieCredits}
                    tvCredits={tvCredits}
                />
            </>
        )
    } catch (error) {
        console.error("Error in Person page:", error)
        notFound()
    }
}
