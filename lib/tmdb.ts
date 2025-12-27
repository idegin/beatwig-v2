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

const HARDCODED_FILMS: Film[] = [
    { id: 1, title: "The Shawshank Redemption", name: "", overview: "Two imprisoned men bond over years, finding solace and redemption.", poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg", release_date: "1994-09-23", first_air_date: "", vote_average: 8.7, media_type: "movie", genre_ids: [18, 80] },
    { id: 2, title: "The Godfather", name: "", overview: "The aging patriarch of a crime dynasty transfers control to his son.", poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg", release_date: "1972-03-14", first_air_date: "", vote_average: 8.7, media_type: "movie", genre_ids: [18, 80] },
    { id: 3, title: "The Dark Knight", name: "", overview: "Batman faces the Joker in Gotham's darkest hour.", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg", release_date: "2008-07-18", first_air_date: "", vote_average: 8.5, media_type: "movie", genre_ids: [28, 80, 18] },
    { id: 4, title: "Inception", name: "", overview: "A thief steals secrets through dream-sharing technology.", poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg", release_date: "2010-07-16", first_air_date: "", vote_average: 8.4, media_type: "movie", genre_ids: [28, 878, 53] },
    { id: 5, title: "Interstellar", name: "", overview: "A team explores space to ensure humanity's survival.", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: "/pbrkL804c8yAv3zBZR4QPEafpAR.jpg", release_date: "2014-11-05", first_air_date: "", vote_average: 8.4, media_type: "movie", genre_ids: [12, 18, 878] },
    { id: 6, title: "Pulp Fiction", name: "", overview: "Various Los Angeles criminals' lives intertwine.", poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", backdrop_path: "/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg", release_date: "1994-09-10", first_air_date: "", vote_average: 8.5, media_type: "movie", genre_ids: [53, 80] },
    { id: 7, title: "Forrest Gump", name: "", overview: "A man with low IQ witnesses historic events.", poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", backdrop_path: "/7c9UVPPiTPltouxRVY6N9uEGsZW.jpg", release_date: "1994-06-23", first_air_date: "", vote_average: 8.5, media_type: "movie", genre_ids: [35, 18, 10749] },
    { id: 8, title: "The Matrix", name: "", overview: "A hacker discovers reality is a simulation.", poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", backdrop_path: "/icmmSD4vTTDKOq2vvdulafOGw93.jpg", release_date: "1999-03-30", first_air_date: "", vote_average: 8.2, media_type: "movie", genre_ids: [28, 878] },
    { id: 9, title: "Goodfellas", name: "", overview: "The story of Henry Hill and his life in the mob.", poster_path: "/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg", backdrop_path: "/sw7mordbZxgITU877yTpZCud90M.jpg", release_date: "1990-09-12", first_air_date: "", vote_average: 8.5, media_type: "movie", genre_ids: [18, 80] },
    { id: 10, title: "Fight Club", name: "", overview: "An insomniac and soap maker form an underground fight club.", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg", release_date: "1999-10-15", first_air_date: "", vote_average: 8.4, media_type: "movie", genre_ids: [18] },
    { id: 11, title: "The Lord of the Rings: The Fellowship of the Ring", name: "", overview: "A hobbit and companions quest to destroy a powerful ring.", poster_path: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", backdrop_path: "/pIUvQ9Ed35wlWhY2oU6OmwEsmzG.jpg", release_date: "2001-12-18", first_air_date: "", vote_average: 8.4, media_type: "movie", genre_ids: [12, 14, 28] },
    { id: 12, title: "Avatar", name: "", overview: "A marine on an alien planet becomes torn between orders and his new world.", poster_path: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg", backdrop_path: "/o0s4XsEDfDlvit5pDRKjzXR4pp2.jpg", release_date: "2009-12-10", first_air_date: "", vote_average: 7.6, media_type: "movie", genre_ids: [28, 12, 14, 878] },
];

const HARDCODED_GENRES: Genre[] = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
];

async function fetchTMDB<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
    if (!TMDB_ACCESS_TOKEN) {
        throw new Error("TMDB API token not configured")
    }
    
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
    try {
        return await fetchTMDB("/genre/movie/list")
    } catch (error) {
        return { genres: HARDCODED_GENRES }
    }
}

export async function getTVGenres(): Promise<{ genres: Genre[] }> {
    try {
        return await fetchTMDB("/genre/tv/list")
    } catch (error) {
        return { genres: [
            { id: 10759, name: "Action & Adventure" },
            { id: 16, name: "Animation" },
            { id: 35, name: "Comedy" },
            { id: 80, name: "Crime" },
            { id: 99, name: "Documentary" },
            { id: 18, name: "Drama" },
            { id: 10751, name: "Family" },
            { id: 10765, name: "Sci-Fi & Fantasy" },
        ] }
    }
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
        const heroFilm = HARDCODED_FILMS[0]
        return {
            heroData: {
                id: heroFilm.id,
                title: heroFilm.title || "",
                overview: heroFilm.overview,
                backdrop_path: heroFilm.backdrop_path || "",
                poster_path: heroFilm.poster_path || "",
                release_date: heroFilm.release_date || "",
                vote_average: heroFilm.vote_average,
                genres: [],
                runtime: undefined,
                certification: undefined,
                media_type: "movie" as const,
                video_key: undefined,
            },
            nowShowingInTheaters: HARDCODED_FILMS.slice(0, 10),
            upcomingMovies: HARDCODED_FILMS.slice(0, 10),
            romanceMovies: HARDCODED_FILMS.slice(0, 10),
            actionMovies: HARDCODED_FILMS.slice(0, 10),
            popularOnApp: HARDCODED_FILMS.slice(0, 12),
            genres: HARDCODED_GENRES,
            becauseYouWatched: { title: "Trending", films: HARDCODED_FILMS.slice(0, 6) },
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

export interface Country {
    iso_3166_1: string
    english_name: string
    native_name: string
}

export async function loadCountries(): Promise<Country[]> {
    return fetchTMDB<Country[]>("/configuration/countries")
}

export async function loadCountryFilms(
    countryCode: string, 
    page = 1
): Promise<{ results: Film[]; total_pages: number }> {
    const response = await fetchTMDB<{ results: Film[]; total_pages: number }>(
        "/discover/movie", 
        { 
            with_origin_country: countryCode,
            page,
            sort_by: "popularity.desc"
        }
    )
    return {
        results: response.results.map(f => ({ ...f, media_type: "movie" as const })),
        total_pages: response.total_pages
    }
}

export async function loadMovies(page = 1): Promise<{
    heroData: HeroData | null
    genreSections: { genreId: number; genreName: string; films: Film[] }[]
}> {
    try {
        const genresData = await getMovieGenres()
        const allGenres = genresData.genres
        
        const shuffled = [...allGenres].sort(() => Math.random() - 0.5)
        const selectedGenres = shuffled.slice(0, 4)

        const genrePromises = selectedGenres.map(genre => 
            getMoviesByGenre(genre.id, 1)
        )

        const [popularData, ...genreResults] = await Promise.all([
            getPopularMovies(1),
            ...genrePromises
        ])

        const heroFilm = popularData.results[Math.floor(Math.random() * Math.min(5, popularData.results.length))]
        let videoKey: string | undefined

        if (heroFilm) {
            videoKey = await getTrailerKey("movie", heroFilm.id)
        }

        const heroData: HeroData | null = heroFilm ? {
            id: heroFilm.id,
            title: heroFilm.title || "",
            overview: heroFilm.overview,
            backdrop_path: heroFilm.backdrop_path || "",
            poster_path: heroFilm.poster_path || "",
            release_date: heroFilm.release_date || "",
            vote_average: heroFilm.vote_average,
            genres: [],
            runtime: undefined,
            certification: undefined,
            media_type: "movie",
            video_key: videoKey,
        } : null

        const genreSections = selectedGenres.map((genre, index) => ({
            genreId: genre.id,
            genreName: genre.name,
            films: genreResults[index].results.slice(0, 12).map(f => ({ ...f, media_type: "movie" as const }))
        }))

        return { heroData, genreSections }
    } catch (error) {
        console.error("Error loading movies:", error)
        const heroFilm = HARDCODED_FILMS[0]
        return {
            heroData: {
                id: heroFilm.id,
                title: heroFilm.title || "",
                overview: heroFilm.overview,
                backdrop_path: heroFilm.backdrop_path || "",
                poster_path: heroFilm.poster_path || "",
                release_date: heroFilm.release_date || "",
                vote_average: heroFilm.vote_average,
                genres: [],
                runtime: undefined,
                certification: undefined,
                media_type: "movie" as const,
                video_key: undefined,
            },
            genreSections: [
                { genreId: 28, genreName: "Action", films: HARDCODED_FILMS.slice(0, 12) },
                { genreId: 18, genreName: "Drama", films: HARDCODED_FILMS.slice(0, 12) },
                { genreId: 35, genreName: "Comedy", films: HARDCODED_FILMS.slice(0, 12) },
                { genreId: 878, genreName: "Science Fiction", films: HARDCODED_FILMS.slice(0, 12) },
            ]
        }
    }
}

export async function loadTvShows(page = 1): Promise<{
    heroData: HeroData | null
    genreSections: { genreId: number; genreName: string; films: Film[] }[]
}> {
    try {
        const genresData = await getTVGenres()
        const allGenres = genresData.genres
        
        const shuffled = [...allGenres].sort(() => Math.random() - 0.5)
        const selectedGenres = shuffled.slice(0, 4)

        const genrePromises = selectedGenres.map(genre => 
            getTVByGenre(genre.id, 1)
        )

        const [popularData, ...genreResults] = await Promise.all([
            getPopularTVShows(1),
            ...genrePromises
        ])

        const heroFilm = popularData.results[Math.floor(Math.random() * Math.min(5, popularData.results.length))]
        let videoKey: string | undefined

        if (heroFilm) {
            videoKey = await getTrailerKey("tv", heroFilm.id)
        }

        const heroData: HeroData | null = heroFilm ? {
            id: heroFilm.id,
            title: heroFilm.name || "",
            overview: heroFilm.overview,
            backdrop_path: heroFilm.backdrop_path || "",
            poster_path: heroFilm.poster_path || "",
            release_date: heroFilm.first_air_date || "",
            vote_average: heroFilm.vote_average,
            genres: [],
            runtime: undefined,
            certification: undefined,
            media_type: "tv",
            video_key: videoKey,
        } : null

        const genreSections = selectedGenres.map((genre, index) => ({
            genreId: genre.id,
            genreName: genre.name,
            films: genreResults[index].results.slice(0, 12).map(f => ({ ...f, media_type: "tv" as const }))
        }))

        return { heroData, genreSections }
    } catch (error) {
        console.error("Error loading TV shows:", error)
        const heroFilm = HARDCODED_FILMS[0]
        return {
            heroData: {
                id: heroFilm.id,
                title: heroFilm.title || "",
                overview: heroFilm.overview,
                backdrop_path: heroFilm.backdrop_path || "",
                poster_path: heroFilm.poster_path || "",
                release_date: heroFilm.release_date || "",
                vote_average: heroFilm.vote_average,
                genres: [],
                runtime: undefined,
                certification: undefined,
                media_type: "tv" as const,
                video_key: undefined,
            },
            genreSections: [
                { genreId: 10759, genreName: "Action & Adventure", films: HARDCODED_FILMS.slice(0, 12).map(f => ({ ...f, media_type: "tv" as const })) },
                { genreId: 18, genreName: "Drama", films: HARDCODED_FILMS.slice(0, 12).map(f => ({ ...f, media_type: "tv" as const })) },
                { genreId: 35, genreName: "Comedy", films: HARDCODED_FILMS.slice(0, 12).map(f => ({ ...f, media_type: "tv" as const })) },
                { genreId: 10765, genreName: "Sci-Fi & Fantasy", films: HARDCODED_FILMS.slice(0, 12).map(f => ({ ...f, media_type: "tv" as const })) },
            ]
        }
    }
}

export async function loadGenreFilms(
    genreId: number,
    mediaType: "movie" | "tv",
    page = 1
): Promise<{ results: Film[]; total_pages: number; genreName: string }> {
    try {
        const [genresData, filmsData] = await Promise.all([
            mediaType === "movie" ? getMovieGenres() : getTVGenres(),
            mediaType === "movie" ? getMoviesByGenre(genreId, page) : getTVByGenre(genreId, page)
        ])

        const genre = genresData.genres.find(g => g.id === genreId)
        const genreName = genre?.name || "Unknown Genre"

        return {
            results: filmsData.results.map(f => ({ ...f, media_type: mediaType })),
            total_pages: filmsData.total_pages,
            genreName
        }
    } catch (error) {
        console.error("Error loading genre films:", error)
        const genre = HARDCODED_GENRES.find(g => g.id === genreId)
        return { 
            results: HARDCODED_FILMS.slice(0, 20).map(f => ({ ...f, media_type: mediaType })), 
            total_pages: 1, 
            genreName: genre?.name || "Unknown Genre" 
        }
    }
}
