import {SiteHeader} from "@/components/site-header"
import {MediaSection} from "@/components/media-section"
import {MovieCard} from "@/components/movie-card"
import {PersonCard} from "@/components/person-card"
import {searchMovies, searchTVShows, searchPeople} from "@/lib/tmdb"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Film, Tv, Users} from "lucide-react"
import type {Metadata} from "next"

// interface SearchPageProps {
//   params: Promise<{ id: string }>
//   searchParams: {
//     query?: string
//   }
// }
type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({searchParams}: Props): Promise<Metadata> {
    //@ts-ignore
    const query = searchParams.query || ""

    return {
        title: `Search results for "${query}" | BeatWig`,
        description: `Find movies, TV shows, and people related to "${query}". Browse results and discover new content.`,
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            title: `Search results for "${query}" | BeatWig`,
            description: `Find movies, TV shows, and people related to "${query}". Browse results and discover new content.`,
            url: `https://beatwig.site/search?query=${encodeURIComponent(query)}`,
            siteName: "BeatWig",
            type: "website",
        },
        twitter: {
            card: "summary",
            title: `Search results for "${query}" | BeatWig`,
            description: `Find movies, TV shows, and people related to "${query}". Browse results and discover new content.`,
        },
    }
}

export default async function SearchPage({searchParams}: Props) {
    //@ts-ignore
    const query = searchParams.query || ""

    if (!query) {
        return (
            <>
                <SiteHeader/>
                <div className={'flex justify-center'}>
                    <div className="container pt-24 py-20 text-center">
                        <h1 className="text-3xl font-bold mb-4">Search for Movies, TV Shows, and People</h1>
                        <p className="text-muted-foreground">
                            Enter a search term in the search box above to find movies, TV shows, and people.
                        </p>
                    </div>
                </div>
            </>
        )
    }

    // Fetch search results in parallel
    const [moviesData, tvShowsData, peopleData] = await Promise.all([
        searchMovies(query).catch(() => ({results: []})),
        searchTVShows(query).catch(() => ({results: []})),
        searchPeople(query).catch(() => ({results: []})),
    ])

    const movies = moviesData.results || []
    const tvShows = tvShowsData.results || []
    const people = peopleData.results || []

    const totalResults = movies.length + tvShows.length + people.length

    return (
        <>
            <SiteHeader/>

            <div className={'flex justify-center'}>
                <div className="container mt-52 mb-52">
                    <h1 className="text-3xl font-bold mb-2">Search results for "{query}"</h1>
                    <p className="text-muted-foreground mb-8">Found {totalResults} results across movies, TV shows, and
                        people</p>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mb-8">
                            <TabsTrigger value="all">All Results</TabsTrigger>
                            <TabsTrigger value="movies" className="flex items-center gap-2">
                                <Film className="h-4 w-4"/>
                                Movies ({movies.length})
                            </TabsTrigger>
                            <TabsTrigger value="tvshows" className="flex items-center gap-2">
                                <Tv className="h-4 w-4"/>
                                TV Shows ({tvShows.length})
                            </TabsTrigger>
                            {
                                process.env.NODE_ENV === 'development' && <TabsTrigger value="people" className="flex items-center gap-2">
                                    <Users className="h-4 w-4"/>
                                    People ({people.length})
                                </TabsTrigger>
                            }
                        </TabsList>

                        <TabsContent value="all" className="space-y-12">
                            {movies.length > 0 && (
                                <MediaSection
                                    title="Movies"
                                    items={movies}
                                    viewAllHref={`/search/movies?query=${encodeURIComponent(query)}`}
                                />
                            )}

                            {tvShows.length > 0 && (
                                <MediaSection
                                    title="TV Shows"
                                    items={tvShows}
                                    viewAllHref={`/search/tv?query=${encodeURIComponent(query)}`}
                                />
                            )}

                            {people.length > 0 && (
                                <MediaSection
                                    title="People"
                                    items={people}
                                    viewAllHref={`/search/people?query=${encodeURIComponent(query)}`}
                                />
                            )}

                            {totalResults === 0 && (
                                <div className="text-center py-12">
                                    <h2 className="text-xl font-semibold mb-2">No results found</h2>
                                    <p className="text-muted-foreground">
                                        We couldn't find any movies, TV shows, or people matching "{query}".
                                        <br/>
                                        Try a different search term or check your spelling.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="movies">
                            {movies.length > 0 ? (
                                <div
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {movies.map((movie) => (
                                        <MovieCard key={movie.id} media={movie}/>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <h2 className="text-xl font-semibold mb-2">No movies found</h2>
                                    <p className="text-muted-foreground">
                                        We couldn't find any movies matching "{query}".
                                        <br/>
                                        Try a different search term or check your spelling.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="tvshows">
                            {tvShows.length > 0 ? (
                                <div
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {tvShows.map((show) => (
                                        <MovieCard key={show.id} media={show}/>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <h2 className="text-xl font-semibold mb-2">No TV shows found</h2>
                                    <p className="text-muted-foreground">
                                        We couldn't find any TV shows matching "{query}".
                                        <br/>
                                        Try a different search term or check your spelling.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="people">
                            {people.length > 0 ? (
                                <div
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {people.map((person) => (
                                        <PersonCard key={person.id} person={person}/>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <h2 className="text-xl font-semibold mb-2">No people found</h2>
                                    <p className="text-muted-foreground">
                                        We couldn't find any people matching "{query}".
                                        <br/>
                                        Try a different search term or check your spelling.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    )
}

