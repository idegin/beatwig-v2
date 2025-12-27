import { Film, Genre, Network, Person, HeroData } from "@/types/tmdb.types"

const TMDB_ACCESS_TOKEN = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

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

        const heroFilm = trendingData.results[0]
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

        const networks: Network[] = [
            { id: 213, name: "Netflix", logo_path: "/wwemzKWzjKYJFfCeiB57q3r4Bcm.png", origin_country: "US" },
            { id: 2739, name: "Disney+", logo_path: "/gJ8VX6JSu3ciXHuC2dDGAo2lvwM.png", origin_country: "US" },
            { id: 1024, name: "Amazon Prime", logo_path: "/ifhbNuuVnlwYy5oXA5VIb2YR8AZ.png", origin_country: "US" },
            { id: 49, name: "HBO", logo_path: "/tuomPhY2UtuPTqqFnKMVHvSb724.png", origin_country: "US" },
            { id: 2552, name: "Apple TV+", logo_path: "/4KAy34EHvRM25Ih8wb82AuGU7zJ.png", origin_country: "US" },
            { id: 453, name: "Hulu", logo_path: "/pqUTCleNUiTLAVlelGxUgWn1ELh.png", origin_country: "US" },
        ]

        return {
            heroData,
            nowShowingInTheaters: nowShowing,
            upcomingMovies: upcoming,
            romanceMovies: romance,
            actionMovies: action,
            popularOnApp: popular,
            genres,
            networks,
            becauseYouWatched,
            popularPeople,
        }
    } catch (error) {
        console.error("Error fetching TMDB data, using fallback:", error)
        return getFallbackHomePageData()
    }
}

function getFallbackHomePageData() {
    const heroData: HeroData = {
        id: 693134,
        title: "Dune: Part Two",
        overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
        backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        release_date: "2024-02-27",
        vote_average: 8.3,
        genres: ["Action", "Adventure", "Sci-Fi"],
        runtime: 166,
        certification: "PG-13",
        media_type: "movie",
        video_key: "Way9Dexny3w",
    }

    const nowShowingInTheaters: Film[] = [
        { id: 693134, adult: false, backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg", genre_ids: [28, 12, 878], original_language: "en", original_title: "Dune: Part Two", overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen.", popularity: 850.5, poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", release_date: "2024-02-27", title: "Dune: Part Two", video: false, vote_average: 8.3, vote_count: 5200, media_type: "movie" },
        { id: 823464, adult: false, backdrop_path: "/417tYZ4XUyJrtyZXj7HpvWf1E8f.jpg", genre_ids: [16, 28, 12], original_language: "ja", original_title: "Godzilla x Kong", overview: "The legendary titans face a brand new threat lurking within our world.", popularity: 720.3, poster_path: "/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg", release_date: "2024-03-27", title: "Godzilla x Kong: The New Empire", video: false, vote_average: 7.1, vote_count: 3100, media_type: "movie" },
        { id: 940721, adult: false, backdrop_path: "/kYgQzzjNis5jJalYtIHgrom0gOx.jpg", genre_ids: [16, 10751, 35, 14], original_language: "en", original_title: "Inside Out 2", overview: "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected.", popularity: 950.8, poster_path: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg", release_date: "2024-06-11", title: "Inside Out 2", video: false, vote_average: 7.8, vote_count: 4500, media_type: "movie" },
        { id: 653346, adult: false, backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg", genre_ids: [28, 12, 878], original_language: "en", original_title: "Kingdom of the Planet of the Apes", overview: "Several generations in the future following Caesar's reign.", popularity: 680.2, poster_path: "/gKkl37BQuKTanygYQG1pyYgLVgf.jpg", release_date: "2024-05-08", title: "Kingdom of the Planet of the Apes", video: false, vote_average: 7.2, vote_count: 2800, media_type: "movie" },
        { id: 569094, adult: false, backdrop_path: "/4XM8DUTQb3lhLemJC51Jx4a2EuA.jpg", genre_ids: [28, 12, 878], original_language: "en", original_title: "Spider-Man: Across the Spider-Verse", overview: "Miles Morales catapults across the Multiverse.", popularity: 380.2, poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", release_date: "2023-05-31", title: "Spider-Man: Across the Spider-Verse", video: false, vote_average: 8.4, vote_count: 6200, media_type: "movie" },
        { id: 447365, adult: false, backdrop_path: "/t9nyF3r0WAlJ7Kr6xcRYI4jr9jm.jpg", genre_ids: [28, 12, 878], original_language: "en", original_title: "Guardians of the Galaxy Vol. 3", overview: "Peter Quill must rally his team around him.", popularity: 290.4, poster_path: "/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg", release_date: "2023-05-03", title: "Guardians of the Galaxy Vol. 3", video: false, vote_average: 8.0, vote_count: 5800, media_type: "movie" },
    ]

    const upcomingMovies: Film[] = [
        { id: 912649, adult: false, backdrop_path: "/fDmci71SMkfZM8RnCuXJVDPaSdE.jpg", genre_ids: [16, 10751, 35, 12], original_language: "en", original_title: "Moana 2", overview: "Moana journeys alongside Maui and a new crew to the far seas of Oceania.", popularity: 520.8, poster_path: "/4YZpsylmjHbqeWzjKpUEF8gcLNW.jpg", release_date: "2025-11-27", title: "Moana 2", video: false, vote_average: 7.0, vote_count: 100, media_type: "movie" },
        { id: 668489, adult: false, backdrop_path: "/fY3lD0jM5AoHJMunjGWqJ0hRteI.jpg", genre_ids: [878, 12, 28], original_language: "en", original_title: "Superman", overview: "Superman embarks on a journey to reconcile his Kryptonian heritage.", popularity: 480.5, poster_path: "/d7PIR3cAMsLzEzUbP2hqJy3LyI1.jpg", release_date: "2025-07-11", title: "Superman", video: false, vote_average: 0, vote_count: 0, media_type: "movie" },
        { id: 1064028, adult: false, backdrop_path: "/9nhjGaFLKtddDPtPaX5EmKqsWdH.jpg", genre_ids: [28, 878, 12], original_language: "en", original_title: "Captain America: Brave New World", overview: "Sam Wilson finds himself in the middle of an international incident.", popularity: 420.3, poster_path: "/pzIddUEMWhWzfvLI3TwxUG2wGoi.jpg", release_date: "2025-02-14", title: "Captain America: Brave New World", video: false, vote_average: 0, vote_count: 0, media_type: "movie" },
        { id: 986056, adult: false, backdrop_path: "/45zVtZx6Tzx3RKeDziK5NsGDPpm.jpg", genre_ids: [28, 878, 12], original_language: "en", original_title: "Thunderbolts", overview: "A group of antiheroes are recruited by the government.", popularity: 350.2, poster_path: "/gQa28VnHNBNq9lPtSxFI2vqjBKz.jpg", release_date: "2025-05-02", title: "Thunderbolts*", video: false, vote_average: 0, vote_count: 0, media_type: "movie" },
        { id: 1001311, adult: false, backdrop_path: "/6Wdl9N6dL0Hi0T1qJLWSz6gMLbd.jpg", genre_ids: [28, 12, 53], original_language: "en", original_title: "Mission: Impossible", overview: "Ethan Hunt and the IMF team must track down a terrifying new weapon.", popularity: 320.8, poster_path: "/z0gMfqfyU6VR5a6LjTHG8b2MWDQ.jpg", release_date: "2025-05-23", title: "Mission: Impossible – The Final Reckoning", video: false, vote_average: 0, vote_count: 0, media_type: "movie" },
        { id: 950387, adult: false, backdrop_path: "/xlkclSE4aq7r3JsFIJRgs21zUew.jpg", genre_ids: [27, 9648, 53], original_language: "en", original_title: "A Quiet Place: Day One", overview: "As New York City is invaded by alien creatures who hunt by sound.", popularity: 380.6, poster_path: "/hU42CRk14JuPEdqZG3AWmagiPAP.jpg", release_date: "2024-06-28", title: "A Quiet Place: Day One", video: false, vote_average: 7.0, vote_count: 1500, media_type: "movie" },
    ]

    const romanceMovies: Film[] = [
        { id: 597, adult: false, backdrop_path: "/8lTMhLGdqYoScxdZqFfs5BKQJ7Z.jpg", genre_ids: [18, 10749], original_language: "en", original_title: "Titanic", overview: "101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic.", popularity: 110.5, poster_path: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", release_date: "1997-11-18", title: "Titanic", video: false, vote_average: 7.9, vote_count: 23000, media_type: "movie" },
        { id: 313369, adult: false, backdrop_path: "/ndlQ2Cuc3cjTL7lTynw6I4boP4S.jpg", genre_ids: [10749, 18], original_language: "en", original_title: "La La Land", overview: "Mia and Sebastian are faced with decisions that begin to fray their love affair.", popularity: 75.8, poster_path: "/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg", release_date: "2016-11-29", title: "La La Land", video: false, vote_average: 7.9, vote_count: 15000, media_type: "movie" },
        { id: 332562, adult: false, backdrop_path: "/wrFpXMNBRj2PBiN4Z5kix51XaIZ.jpg", genre_ids: [10749, 18], original_language: "en", original_title: "A Star Is Born", overview: "Seasoned musician Jackson Maine discovers and falls in love with struggling artist Ally.", popularity: 88.2, poster_path: "/wrFpXMNBRj2PBiN4Z5kix51XaIZ.jpg", release_date: "2018-10-03", title: "A Star Is Born", video: false, vote_average: 7.5, vote_count: 11000, media_type: "movie" },
        { id: 11036, adult: false, backdrop_path: "/gL8myjGc2qrmqVosyGm5CWTir9A.jpg", genre_ids: [35, 18, 10749], original_language: "en", original_title: "The Notebook", overview: "An epic love story centered around an older man who reads aloud to a woman.", popularity: 82.4, poster_path: "/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg", release_date: "2004-06-25", title: "The Notebook", video: false, vote_average: 7.9, vote_count: 10500, media_type: "movie" },
        { id: 509, adult: false, backdrop_path: "/2Ie92LDycpAsQzWqL1DRqx41Dn.jpg", genre_ids: [18, 10749], original_language: "en", original_title: "Notting Hill", overview: "William Thacker's humdrum existence is thrown into romantic turmoil.", popularity: 65.3, poster_path: "/bGl7QxsxflrPw7E9pDPpwvJZks2.jpg", release_date: "1999-05-13", title: "Notting Hill", video: false, vote_average: 7.2, vote_count: 5800, media_type: "movie" },
        { id: 76341, adult: false, backdrop_path: "/nlCHUWjY9XWbuEUQauCBgnGcoe.jpg", genre_ids: [10749, 35], original_language: "en", original_title: "Crazy Rich Asians", overview: "An American-born Chinese economics professor accompanies her boyfriend to Singapore.", popularity: 68.9, poster_path: "/1XxL4LJ5WHdrcYcihEZUCgNCpAW.jpg", release_date: "2018-08-15", title: "Crazy Rich Asians", video: false, vote_average: 7.1, vote_count: 4200, media_type: "movie" },
    ]

    const actionMovies: Film[] = [
        { id: 603692, adult: false, backdrop_path: "/h8gHn0OzBoaefsYseUByqsmEDMY.jpg", genre_ids: [28, 53, 80], original_language: "en", original_title: "John Wick: Chapter 4", overview: "John Wick uncovers a path to defeating The High Table.", popularity: 310.5, poster_path: "/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg", release_date: "2023-03-22", title: "John Wick: Chapter 4", video: false, vote_average: 7.9, vote_count: 8500, media_type: "movie" },
        { id: 385687, adult: false, backdrop_path: "/bWm2kLu0EE0r8YuH3VHV0Af3s5O.jpg", genre_ids: [28, 12, 878], original_language: "en", original_title: "Fast X", overview: "Dom Toretto and his family face the most lethal opponent they've ever faced.", popularity: 280.3, poster_path: "/fiVW06jE7z9YnO4trhaMEdclSiC.jpg", release_date: "2023-05-17", title: "Fast X", video: false, vote_average: 7.1, vote_count: 5200, media_type: "movie" },
        { id: 667538, adult: false, backdrop_path: "/8pjWz2lt29KyVGoq1mXYu6Br7dE.jpg", genre_ids: [28, 878, 27], original_language: "en", original_title: "Transformers: Rise of the Beasts", overview: "Optimus Prime and the Autobots must team up with a powerful faction.", popularity: 220.6, poster_path: "/gPbM0MK8CP8A174rmUwGsADNYKD.jpg", release_date: "2023-06-06", title: "Transformers: Rise of the Beasts", video: false, vote_average: 7.3, vote_count: 3900, media_type: "movie" },
        { id: 640146, adult: false, backdrop_path: "/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg", genre_ids: [28, 12, 878], original_language: "en", original_title: "Ant-Man and the Wasp: Quantumania", overview: "The Lang-Van Dyne family find themselves exploring the Quantum Realm.", popularity: 250.8, poster_path: "/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg", release_date: "2023-02-15", title: "Ant-Man and the Wasp: Quantumania", video: false, vote_average: 6.5, vote_count: 4800, media_type: "movie" },
        { id: 155, adult: false, backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg", genre_ids: [28, 80, 18, 53], original_language: "en", original_title: "The Dark Knight", overview: "Batman raises the stakes in his war on crime.", popularity: 130.4, poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", release_date: "2008-07-16", title: "The Dark Knight", video: false, vote_average: 8.5, vote_count: 30000, media_type: "movie" },
        { id: 27205, adult: false, backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg", genre_ids: [28, 878, 12], original_language: "en", original_title: "Inception", overview: "Cobb steals information from his targets by entering their dreams.", popularity: 150.5, poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", release_date: "2010-07-15", title: "Inception", video: false, vote_average: 8.4, vote_count: 32000, media_type: "movie" },
    ]

    const popularOnApp: Film[] = [
        { id: 76600, adult: false, backdrop_path: "/ovM06PdF3M8wvKb06i4sjW3xoww.jpg", genre_ids: [878, 12, 28], original_language: "en", original_title: "Avatar: The Way of Water", overview: "Learn the story of the Sully family.", popularity: 450.5, poster_path: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", release_date: "2022-12-14", title: "Avatar: The Way of Water", video: false, vote_average: 7.7, vote_count: 11000, media_type: "movie" },
        { id: 502356, adult: false, backdrop_path: "/iJQIbOPm81fPEGKt5BPuZmfnA54.jpg", genre_ids: [16, 12, 10751, 14, 35], original_language: "en", original_title: "The Super Mario Bros. Movie", overview: "Mario and Luigi are transported down a mysterious pipe.", popularity: 380.2, poster_path: "/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg", release_date: "2023-04-05", title: "The Super Mario Bros. Movie", video: false, vote_average: 7.5, vote_count: 8200, media_type: "movie" },
        { id: 315162, adult: false, backdrop_path: "/ouB7hwclG7QI3INoYJHaZL4vOaa.jpg", genre_ids: [16, 10751, 14, 12, 35, 18], original_language: "en", original_title: "Puss in Boots: The Last Wish", overview: "Puss in Boots discovers he has burned through eight of his nine lives.", popularity: 320.8, poster_path: "/kuf6dutpsT0vSVehic3EZIqkOBt.jpg", release_date: "2022-12-07", title: "Puss in Boots: The Last Wish", video: false, vote_average: 8.3, vote_count: 7500, media_type: "movie" },
        { id: 94997, adult: false, backdrop_path: "/suopoADq0k8YZr4dQXcU6pToj6s.jpg", genre_ids: [10765, 18, 10759], original_language: "en", overview: "The Targaryen dynasty is at the absolute apex of its power.", popularity: 420.5, poster_path: "/z2yahl2uefxDCl0nogcRBstwruJ.jpg", first_air_date: "2022-08-21", name: "House of the Dragon", vote_average: 8.4, vote_count: 4200, media_type: "tv" },
        { id: 1396, adult: false, backdrop_path: "/84XPpjGvxNyExjSuLQe0SzioErt.jpg", genre_ids: [18, 80], original_language: "en", overview: "A New Mexico chemistry teacher is diagnosed with Stage III cancer.", popularity: 380.8, poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", first_air_date: "2008-01-20", name: "Breaking Bad", vote_average: 8.9, vote_count: 12000, media_type: "tv" },
        { id: 66732, adult: false, backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg", genre_ids: [18, 10765], original_language: "en", overview: "When a young boy vanishes, a small town uncovers a mystery.", popularity: 350.2, poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", first_air_date: "2016-07-15", name: "Stranger Things", vote_average: 8.6, vote_count: 16000, media_type: "tv" },
    ]

    const genres: Genre[] = [
        { id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 16, name: "Animation" }, { id: 35, name: "Comedy" },
        { id: 80, name: "Crime" }, { id: 99, name: "Documentary" }, { id: 18, name: "Drama" }, { id: 10751, name: "Family" },
        { id: 14, name: "Fantasy" }, { id: 36, name: "History" }, { id: 27, name: "Horror" }, { id: 10402, name: "Music" },
        { id: 9648, name: "Mystery" }, { id: 10749, name: "Romance" }, { id: 878, name: "Science Fiction" }, { id: 53, name: "Thriller" },
    ]

    const networks: Network[] = [
        { id: 213, name: "Netflix", logo_path: "/wwemzKWzjKYJFfCeiB57q3r4Bcm.png", origin_country: "US" },
        { id: 2739, name: "Disney+", logo_path: "/gJ8VX6JSu3ciXHuC2dDGAo2lvwM.png", origin_country: "US" },
        { id: 1024, name: "Amazon Prime", logo_path: "/ifhbNuuVnlwYy5oXA5VIb2YR8AZ.png", origin_country: "US" },
        { id: 49, name: "HBO", logo_path: "/tuomPhY2UtuPTqqFnKMVHvSb724.png", origin_country: "US" },
        { id: 2552, name: "Apple TV+", logo_path: "/4KAy34EHvRM25Ih8wb82AuGU7zJ.png", origin_country: "US" },
        { id: 453, name: "Hulu", logo_path: "/pqUTCleNUiTLAVlelGxUgWn1ELh.png", origin_country: "US" },
    ]

    const becauseYouWatched = {
        title: "Inception",
        films: [
            { id: 157336, adult: false, backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg", genre_ids: [18, 878, 53], original_language: "en", original_title: "Tenet", overview: "Armed with only one word - Tenet.", popularity: 120.3, poster_path: "/k68nPLbIST6NP96JmTxmZijEvCA.jpg", release_date: "2020-08-22", title: "Tenet", video: false, vote_average: 7.2, vote_count: 8500, media_type: "movie" as const },
            { id: 272, adult: false, backdrop_path: "/66TuALbLYNPC5Jxd4JFgLn8K3hs.jpg", genre_ids: [28, 80, 18, 53], original_language: "en", original_title: "Batman Begins", overview: "Bruce Wayne dedicates his life to uncovering corruption.", popularity: 95.2, poster_path: "/8RW2runSEc34IwKN2D1aPcJd2UL.jpg", release_date: "2005-06-10", title: "Batman Begins", video: false, vote_average: 7.7, vote_count: 18000, media_type: "movie" as const },
            { id: 155, adult: false, backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg", genre_ids: [28, 80, 18, 53], original_language: "en", original_title: "The Dark Knight", overview: "Batman raises the stakes in his war on crime.", popularity: 130.4, poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", release_date: "2008-07-16", title: "The Dark Knight", video: false, vote_average: 8.5, vote_count: 30000, media_type: "movie" as const },
            { id: 49026, adult: false, backdrop_path: "/f6ljQGv7WnJuwBPty017oPWfqjx.jpg", genre_ids: [28, 80, 53], original_language: "en", original_title: "The Dark Knight Rises", overview: "Batman assumes responsibility for Dent's crimes.", popularity: 88.7, poster_path: "/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg", release_date: "2012-07-16", title: "The Dark Knight Rises", video: false, vote_average: 7.8, vote_count: 21000, media_type: "movie" as const },
            { id: 258489, adult: false, backdrop_path: "/5WP6z3iqsRg8ZWHM9Xa5GsVLKD3.jpg", genre_ids: [18, 53, 878], original_language: "en", original_title: "The Prestige", overview: "Two magicians engage in a life-long battle for supremacy.", popularity: 75.3, poster_path: "/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg", release_date: "2006-10-17", title: "The Prestige", video: false, vote_average: 8.2, vote_count: 14000, media_type: "movie" as const },
            { id: 27205, adult: false, backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg", genre_ids: [28, 878, 12], original_language: "en", original_title: "Interstellar", overview: "A group of explorers surpass the limitations on human space travel.", popularity: 150.5, poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", release_date: "2014-11-05", title: "Interstellar", video: false, vote_average: 8.4, vote_count: 32000, media_type: "movie" as const },
        ],
    }

    const popularPeople: Person[] = [
    { id: 1136406, name: "Tom Holland", profile_path: "/bBRlrpJm9XkNSg0YT5LCaxqoFMX.jpg", known_for_department: "Acting", popularity: 120.5 },
    { id: 1245, name: "Scarlett Johansson", profile_path: "/6NsMbJXRlDZuDzatN2akFY8J3IS.jpg", known_for_department: "Acting", popularity: 115.2 },
    { id: 17419, name: "Zendaya", profile_path: "/6TE2AlOUqcKAitORHo6KdyQmDYZ.jpg", known_for_department: "Acting", popularity: 110.8 },
    { id: 1892, name: "Matt Damon", profile_path: "/elSlNgV8xVFRgBBYoOehRqSQvVt.jpg", known_for_department: "Acting", popularity: 95.3 },
    { id: 500, name: "Tom Cruise", profile_path: "/8qBylBsQf4llkGrWR3qAsOtOU8O.jpg", known_for_department: "Acting", popularity: 130.1 },
    { id: 73457, name: "Chris Pratt", profile_path: "/83o3koL82jt30EJ0rz4Bnzrt2dd.jpg", known_for_department: "Acting", popularity: 88.6 },
    { id: 1190668, name: "Timothée Chalamet", profile_path: "/BE2sdjpgsa2rNTFa66f7upkaOP.jpg", known_for_department: "Acting", popularity: 140.2 },
    { id: 560057, name: "Florence Pugh", profile_path: "/6chZcnjWEiFfpmB6D5XpA4qYg5h.jpg", known_for_department: "Acting", popularity: 105.4 },
    { id: 2963, name: "Ana de Armas", profile_path: "/3vxvsmYLTf4jnr163SUlBIw51ee.jpg", known_for_department: "Acting", popularity: 98.7 },
    { id: 6193, name: "Leonardo DiCaprio", profile_path: "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg", known_for_department: "Acting", popularity: 125.9 },
    { id: 72129, name: "Jennifer Lawrence", profile_path: "/mDKMsjOMytyBiy86dIkDN4MQBf4.jpg", known_for_department: "Acting", popularity: 92.1 },
    { id: 3223, name: "Robert Downey Jr.", profile_path: "/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg", known_for_department: "Acting", popularity: 118.4 },
    ]

    return {
        heroData,
        nowShowingInTheaters,
        upcomingMovies,
        romanceMovies,
        actionMovies,
        popularOnApp,
        genres,
        networks,
        becauseYouWatched,
        popularPeople,
    }
}

