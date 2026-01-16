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
    if (!TMDB_ACCESS_TOKEN) {
        console.error("[TMDB] API token not configured")
        throw new Error("TMDB API token not configured")
    }
    
    const url = buildUrl(endpoint, params)
    
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        console.log(`[TMDB] Fetching: ${endpoint}`)
        const response = await fetch(url, {
            next: { revalidate: 3600 },
            headers: {
                Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            signal: controller.signal,
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
            console.error(`[TMDB] API Error: ${response.status} for ${endpoint}`)
            throw new Error(`TMDB API Error: ${response.status}`)
        }

        console.log(`[TMDB] Success: ${endpoint}`)
        return response.json()
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                console.error(`[TMDB] Request timeout for ${endpoint}`)
                throw new Error(`TMDB API timeout: ${endpoint}`)
            }
            console.error(`[TMDB] Error fetching ${endpoint}:`, error.message)
        }
        throw error
    }
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
        return { genres: [] }
    }
}

export async function getTVGenres(): Promise<{ genres: Genre[] }> {
    try {
        return await fetchTMDB("/genre/tv/list")
    } catch (error) {
        return { genres: [] }
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
            genresData,
            popularPeopleData,
        ] = await Promise.all([
            getTrendingAll("week"),
            getNowPlayingMovies(),
            getUpcomingMovies(),
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

        const nowShowing = nowPlayingData.results.slice(0, 12).map((f) => ({ ...f, media_type: "movie" as const }))
        const upcoming = upcomingData.results.slice(0, 12).map((f) => ({ ...f, media_type: "movie" as const }))
        const genres = genresData.genres.slice(0, 16)
        const popularPeople = popularPeopleData.results.slice(0, 12)

        return {
            heroData,
            nowShowingInTheaters: nowShowing,
            upcomingMovies: upcoming,
            genres,
            popularPeople,
        }
    } catch (error) {
        console.error("Error fetching TMDB data:", error)
        return {
            heroData: null,
            nowShowingInTheaters: [],
            upcomingMovies: [],
            genres: [],
            popularPeople: [],
        }
    }
}

export async function getForYouPageData() {
    try {
        const [
            trendingData,
            genresData,
        ] = await Promise.all([
            getTrendingAll("week"),
            getMovieGenres(),
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

        const genres = genresData.genres.slice(0, 16)

        const becauseYouWatched = {
            title: trendingData.results[1]?.title || trendingData.results[1]?.name || "Trending",
            films: trendingData.results.slice(2, 8).map((f) => ({
                ...f,
                media_type: (f.media_type as "movie" | "tv") || "movie",
            })),
        }

        return {
            heroData,
            genres,
            becauseYouWatched,
        }
    } catch (error) {
        console.error("Error fetching For You page data:", error)
        return {
            heroData: null,
            genres: [],
            becauseYouWatched: { title: "", films: [] },
        }
    }
}

export async function getRecommendationsFromAlgorithm(
    algorithmItems: {
        id: number
        mediaType: "movie" | "tv"
        title: string
        genreIds: number[]
        rank: number
        lastInteractedAt?: Date
        interactionCount?: number
    }[],
    count: number = 3,
    diversityFactor: number = 0.3
): Promise<{ title: string; films: Film[]; mediaType: "movie" | "tv" }[]> {
    if (!algorithmItems.length) {
        return []
    }

    const calculateRecencyScore = (date?: Date): number => {
        if (!date) return 0.5
        const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
        if (daysSince <= 0) return 1
        if (daysSince >= 30) return 0.1
        return Math.max(0.1, 1 - (daysSince / 30) * 0.9)
    }

    const weightedItems = algorithmItems.map((item, index) => {
        const recencyScore = calculateRecencyScore(item.lastInteractedAt)
        const normalizedRank = Math.min(item.rank, 20) / 20
        const randomFactor = Math.random() * diversityFactor
        const positionPenalty = index * 0.03
        
        const weight = 
            (normalizedRank * 0.5) + 
            (recencyScore * 0.3) + 
            randomFactor - 
            positionPenalty

        return { item, weight }
    })

    weightedItems.sort((a, b) => b.weight - a.weight)
    
    const selectedItems = weightedItems.slice(0, Math.min(count, algorithmItems.length))
    const recommendations: { title: string; films: Film[]; mediaType: "movie" | "tv" }[] = []

    const seenGenres = new Set<number>()
    
    for (const { item } of selectedItems) {
        const primaryGenres = item.genreIds.slice(0, 2)
        const hasOverlap = primaryGenres.some(g => seenGenres.has(g))
        
        if (hasOverlap && recommendations.length >= 2) {
            continue
        }

        try {
            const endpoint = item.mediaType === "movie" 
                ? `/movie/${item.id}/recommendations` 
                : `/tv/${item.id}/recommendations`
            
            const randomPage = Math.floor(Math.random() * 3) + 1
            const data = await fetchTMDB<{ results: Film[] }>(endpoint, { page: randomPage })
            
            if (data.results && data.results.length > 0) {
                const shuffledResults = [...data.results]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 12)
                
                recommendations.push({
                    title: item.title,
                    mediaType: item.mediaType,
                    films: shuffledResults.map((f) => ({
                        ...f,
                        media_type: item.mediaType,
                    })),
                })
                
                primaryGenres.forEach(g => seenGenres.add(g))
            }
        } catch (error) {
            console.error(`Error fetching recommendations for ${item.id}:`, error)
        }
    }

    return recommendations
}

export async function getRecommendationsByGenre(
    genreId: number,
    genreName: string,
    mediaType: "movie" | "tv" = "movie"
): Promise<{ genreName: string; films: Film[] } | null> {
    try {
        const endpoint = mediaType === "movie" ? "/discover/movie" : "/discover/tv"
        const randomPage = Math.floor(Math.random() * 5) + 1
        const data = await fetchTMDB<{ results: Film[] }>(endpoint, {
            with_genres: genreId,
            sort_by: "popularity.desc",
            page: randomPage,
        })

        if (data.results && data.results.length > 0) {
            return {
                genreName,
                films: data.results.slice(0, 12).map((f) => ({
                    ...f,
                    media_type: mediaType,
                })),
            }
        }
        return null
    } catch (error) {
        console.error("Error fetching recommendations by genre:", error)
        return null
    }
}

export async function getRecommendationsByKeyword(
    keyword: string
): Promise<{ keyword: string; films: Film[] } | null> {
    try {
        const searchData = await fetchTMDB<{ results: { id: number; name: string }[] }>(
            "/search/keyword",
            { query: keyword }
        )
        
        if (!searchData.results || searchData.results.length === 0) {
            return null
        }

        const keywordId = searchData.results[0].id
        const randomPage = Math.floor(Math.random() * 3) + 1
        
        const moviesData = await fetchTMDB<{ results: Film[] }>(
            "/discover/movie",
            { with_keywords: keywordId, sort_by: "popularity.desc", page: randomPage }
        )

        if (moviesData.results && moviesData.results.length > 0) {
            return {
                keyword,
                films: moviesData.results.slice(0, 12).map((f) => ({
                    ...f,
                    media_type: "movie" as const,
                })),
            }
        }
        return null
    } catch (error) {
        console.error("Error fetching recommendations by keyword:", error)
        return null
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

    const genreObjects = (data.genres as { id: number; name: string }[]) || []
    const genres = genreObjects.map((g) => g.name)

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
        genreObjects,
        status: data.status as string,
        original_language: data.original_language as string,
        popularity: data.popularity as number | undefined,
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
        return { heroData: null, genreSections: [] }
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
        return { heroData: null, genreSections: [] }
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
        return { results: [], total_pages: 0, genreName: "Unknown Genre" }
    }
}
