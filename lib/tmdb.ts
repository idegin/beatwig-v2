import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from "@/app/constants"
import { Film, Genre, Person, HeroData, FilmDetailsData, CastMember, CrewMember, Video, Image, Review, Keyword, Season, Episode, ProductionCompany, ProductionCountry, SpokenLanguage } from "@/types/tmdb.types"



interface TMDBOptions {
    adult?: boolean
    language?: string
}

const defaultOptions: TMDBOptions = {
    adult: true,
    language: "en-US",
}

function buildUrl(endpoint: string, params: Record<string, string | number | boolean> = {}): string {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`)
    url.searchParams.set("include_adult", String(defaultOptions.adult))
    url.searchParams.set("language", defaultOptions.language || "en-US")

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value))
    })

    return url.toString()
}

async function fetchTMDB<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
    const url = buildUrl(endpoint, params)
    const response = await fetch(url, {
        next: { revalidate: 3600 },
        headers: {
            Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
    })

    if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`)
    }

    return response.json()
}

export async function getNowPlayingMovies(page = 1): Promise<{ results: Film[]; total_pages: number }> {
    return fetchTMDB("/movie/now_playing", { page })
}

export async function getUpcomingMovies(page = 1): Promise<{ results: Film[]; total_pages: number }> {
    return fetchTMDB("/movie/upcoming", { page })
}

export async function getPopularMovies(page = 1): Promise<{ results: Film[]; total_pages: number }> {
    return fetchTMDB("/movie/popular", { page })
}

export async function getTopRatedMovies(page = 1): Promise<{ results: Film[]; total_pages: number }> {
    return fetchTMDB("/movie/top_rated", { page })
}

export async function getPopularTVShows(page = 1): Promise<{ results: Film[]; total_pages: number }> {
    return fetchTMDB("/tv/popular", { page })
}

export async function getTrendingAll(timeWindow: "day" | "week" = "week"): Promise<{ results: Film[] }> {
    return fetchTMDB(`/trending/all/${timeWindow}`)
}

export async function getMoviesByGenre(genreId: number, page = 1): Promise<{ results: Film[]; total_pages: number }> {
    return fetchTMDB("/discover/movie", { with_genres: genreId, page, sort_by: "popularity.desc" })
}

export async function getTVByGenre(genreId: number, page = 1): Promise<{ results: Film[]; total_pages: number }> {
    return fetchTMDB("/discover/tv", { with_genres: genreId, page, sort_by: "popularity.desc" })
}

export async function getMovieGenres(): Promise<{ genres: Genre[] }> {
    return fetchTMDB("/genre/movie/list")
}

export async function getTVGenres(): Promise<{ genres: Genre[] }> {
    return fetchTMDB("/genre/tv/list")
}

export async function getMovieDetails(movieId: number): Promise<unknown> {
    return fetchTMDB(`/movie/${movieId}`, { append_to_response: "videos,credits,reviews,keywords,similar,images" })
}

export async function getTVDetails(tvId: number): Promise<unknown> {
    return fetchTMDB(`/tv/${tvId}`, { append_to_response: "videos,credits,reviews,keywords,similar,images" })
}

export async function getMovieVideos(movieId: number): Promise<{ results: { key: string; type: string; site: string }[] }> {
    return fetchTMDB(`/movie/${movieId}/videos`)
}

export async function getTVVideos(tvId: number): Promise<{ results: { key: string; type: string; site: string }[] }> {
    return fetchTMDB(`/tv/${tvId}/videos`)
}

export async function getPopularPeople(page = 1): Promise<{ results: Person[]; total_pages: number }> {
    return fetchTMDB("/person/popular", { page })
}

export async function getPersonDetails(personId: number): Promise<unknown> {
    return fetchTMDB(`/person/${personId}`, { append_to_response: "movie_credits,tv_credits,images" })
}

export async function searchMulti(query: string, page = 1): Promise<{ results: (Film | Person)[] }> {
    return fetchTMDB("/search/multi", { query, page })
}

export async function getTrailerKey(mediaType: "movie" | "tv", id: number): Promise<string | undefined> {
    const endpoint = mediaType === "movie" ? `/movie/${id}/videos` : `/tv/${id}/videos`
    const data = await fetchTMDB<{ results: { key: string; type: string; site: string }[] }>(endpoint)
    const trailer = data.results.find((v) => v.type === "Trailer" && v.site === "YouTube")
    return trailer?.key
}

export async function getHomePageData() {
    try {
        const [
            trendingData,
            nowPlayingData,
            upcomingData,
            romanceData,
            actionData,
            popularData,
            genresData,
            popularPeopleData,
        ] = await Promise.all([
            getTrendingAll("week"),
            getNowPlayingMovies(),
            getUpcomingMovies(),
            getMoviesByGenre(10749),
            getMoviesByGenre(28),
            getPopularMovies(),
            getMovieGenres(),
            getPopularPeople(),
        ])

        const randomIndex = Math.floor(Math.random() * Math.min(5, trendingData.results.length))
        const heroFilm = trendingData.results[randomIndex]
        let videoKey: string | undefined

        if (heroFilm) {
            const mediaType = heroFilm.media_type || (heroFilm.title ? "movie" : "tv")
            videoKey = await getTrailerKey(mediaType, heroFilm.id)
        }

        const heroData: HeroData | null = heroFilm
            ? {
                id: heroFilm.id,
                title: heroFilm.title || heroFilm.name || "",
                overview: heroFilm.overview,
                backdrop_path: heroFilm.backdrop_path || "",
                poster_path: heroFilm.poster_path || "",
                release_date: heroFilm.release_date || heroFilm.first_air_date || "",
                vote_average: heroFilm.vote_average,
                genres: [],
                runtime: undefined,
                certification: undefined,
                media_type: (heroFilm.media_type as "movie" | "tv") || "movie",
                video_key: videoKey,
            }
            : null

        const nowShowing = nowPlayingData.results.slice(0, 10).map((f) => ({ ...f, media_type: "movie" as const }))
        const upcoming = upcomingData.results.slice(0, 10).map((f) => ({ ...f, media_type: "movie" as const }))
        const romance = romanceData.results.slice(0, 10).map((f) => ({ ...f, media_type: "movie" as const }))
        const action = actionData.results.slice(0, 10).map((f) => ({ ...f, media_type: "movie" as const }))
        const popular = popularData.results.slice(0, 12).map((f) => ({ ...f, media_type: "movie" as const }))
        const genres = genresData.genres.slice(0, 16)
        const popularPeople = popularPeopleData.results.slice(0, 12)

        const becauseYouWatched = {
            title: trendingData.results[1]?.title || trendingData.results[1]?.name || "Trending",
            films: trendingData.results.slice(2, 8).map((f) => ({
                ...f,
                media_type: (f.media_type as "movie" | "tv") || "movie",
            })),
        }

        const networks = undefined

        return {
            heroData,
            nowShowingInTheaters: nowShowing,
            upcomingMovies: upcoming,
            romanceMovies: romance,
            actionMovies: action,
            popularOnApp: popular,
            genres,
            becauseYouWatched,
            popularPeople,
        }
    } catch (error) {
        console.error("Error fetching TMDB data:", error)
        return {
            heroData: null,
            nowShowingInTheaters: [],
            upcomingMovies: [],
            romanceMovies: [],
            actionMovies: [],
            popularOnApp: [],
            genres: [],
            becauseYouWatched: { title: "", films: [] },
            popularPeople: [],
        }
    }
}

export async function getFilmDetails(id: number, mediaType: "movie" | "tv"): Promise<FilmDetailsData> {
    const endpoint = mediaType === "movie" ? `/movie/${id}` : `/tv/${id}`
    const data = await fetchTMDB<Record<string, unknown>>(endpoint, {
        append_to_response: "videos,credits,reviews,keywords,similar,images"
    })

    const isTV = mediaType === "tv"
    const title = isTV ? (data.name as string) : (data.title as string)
    const releaseDate = isTV ? (data.first_air_date as string) : (data.release_date as string)
    const runtime = isTV ? (data.episode_run_time as number[])?.[0] : (data.runtime as number)

    const videos = ((data.videos as { results: Video[] })?.results || []).filter(
        (v: Video) => v.site === "YouTube"
    )
    const trailer = videos.find((v: Video) => v.type === "Trailer") || videos[0]

    const genres = ((data.genres as { id: number; name: string }[]) || []).map((g) => g.name)

    const credits = data.credits as { cast: CastMember[]; crew: CrewMember[] } | undefined
    const cast = (credits?.cast || []).slice(0, 15)
    const crew = credits?.crew || []

    const images = data.images as { backdrops: Image[]; posters: Image[] } | undefined
    const backdrops = (images?.backdrops || []).slice(0, 12)
    const posters = (images?.posters || []).slice(0, 8)

    const reviews = ((data.reviews as { results: Review[] })?.results || []).slice(0, 10)
    const keywords = mediaType === "movie"
        ? ((data.keywords as { keywords: Keyword[] })?.keywords || [])
        : ((data.keywords as { results: Keyword[] })?.results || [])

    const similar = ((data.similar as { results: Film[] })?.results || []).slice(0, 12).map((f) => ({
        ...f,
        media_type: mediaType,
    }))

    let seasons: Season[] | undefined
    if (isTV) {
        seasons = (data.seasons as Season[]) || []
    }

    return {
        id: data.id as number,
        title,
        tagline: data.tagline as string | undefined,
        overview: data.overview as string,
        poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "",
        backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : "",
        release_date: releaseDate || "",
        vote_average: data.vote_average as number,
        runtime,
        genres,
        status: data.status as string,
        original_language: data.original_language as string,
        budget: data.budget as number | undefined,
        revenue: data.revenue as number | undefined,
        video_key: trailer?.key,
        number_of_seasons: isTV ? (data.number_of_seasons as number) : undefined,
        number_of_episodes: isTV ? (data.number_of_episodes as number) : undefined,
        production_companies: (data.production_companies as ProductionCompany[]) || [],
        production_countries: (data.production_countries as ProductionCountry[]) || [],
        spoken_languages: (data.spoken_languages as SpokenLanguage[]) || [],
        cast,
        crew,
        videos,
        backdrops,
        posters,
        reviews,
        keywords,
        similar,
        seasons,
    }
}
