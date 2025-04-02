import { fetchFromTMDB } from "./fetchFromTMDB"

/**
 * Types for TMDB API responses
 */
export interface Movie {
  id: number
  title: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date?: string
  first_air_date?: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  media_type?: string
  popularity: number
}

export interface TVShow {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  media_type?: string
  popularity: number
}

export interface Person {
  id: number
  name: string
  profile_path: string | null
  known_for_department: string
  gender: number
  media_type: string
  popularity: number
  known_for?: Movie[] | TVShow[]
}

export interface MediaResponse {
  page: number
  results: (Movie | TVShow | Person)[]
  total_pages: number
  total_results: number
}

export interface MovieResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface TVResponse {
  page: number
  results: TVShow[]
  total_pages: number
  total_results: number
}

export interface PersonResponse {
  page: number
  results: Person[]
  total_pages: number
  total_results: number
}

export interface Genre {
  id: number
  name: string
}

export interface GenreResponse {
  genres: Genre[]
}

export interface VideosResponse {
  id: number
  results: {
    id: string
    key: string
    name: string
    site: string
    type: string
  }[]
}

/**
 * Get all trending (movies, TV shows, people)
 */
export async function getAllTrending(timeWindow: "day" | "week" = "day") {
  return fetchFromTMDB(`/trending/all/${timeWindow}`) as Promise<MediaResponse>
}

/**
 * Get trending movies
 */
export async function getTrendingMovies(timeWindow: "day" | "week" = "day") {
  return fetchFromTMDB(`/trending/movie/${timeWindow}`) as Promise<MovieResponse>
}

/**
 * Get trending TV shows
 */
export async function getTrendingTVShows(timeWindow: "day" | "week" = "day") {
  return fetchFromTMDB(`/trending/tv/${timeWindow}`) as Promise<TVResponse>
}

/**
 * Get trending people
 */
export async function getTrendingPeople(timeWindow: "day" | "week" = "week") {
  return fetchFromTMDB(`/trending/person/${timeWindow}`) as Promise<PersonResponse>
}

/**
 * Get popular movies
 */
export async function getPopularMovies(page = 1) {
  return fetchFromTMDB("/movie/popular", { page: page.toString() }) as Promise<MovieResponse>
}

/**
 * Get popular TV shows
 */
export async function getPopularTVShows(page = 1) {
  return fetchFromTMDB("/tv/popular", { page: page.toString() }) as Promise<TVResponse>
}

/**
 * Get now playing movies
 */
export async function getNowPlayingMovies(page = 1) {
  return fetchFromTMDB("/movie/now_playing", { page: page.toString() }) as Promise<MovieResponse>
}

/**
 * Get top rated movies
 */
export async function getTopRatedMovies(page = 1) {
  return fetchFromTMDB("/movie/top_rated", { page: page.toString() }) as Promise<MovieResponse>
}

/**
 * Get top rated TV shows
 */
export async function getTopRatedTVShows(page = 1) {
  return fetchFromTMDB("/tv/top_rated", { page: page.toString() }) as Promise<TVResponse>
}

/**
 * Get top rated TV shows with high vote count
 */
export async function getTopRatedTVShowsWithHighVotes(page = 1) {
  return fetchFromTMDB("/discover/tv", {
    page: page.toString(),
    sort_by: "vote_average.desc",
    "vote_count.gte": "200",
    include_adult: "false",
  }) as Promise<TVResponse>
}

/**
 * Get movie details
 */
export async function getMovieDetails(movieId: string) {
  return fetchFromTMDB(`/movie/${movieId}`, {
    append_to_response: "credits,videos,images,recommendations,reviews,keywords",
  })
}

/**
 * Get TV show details
 */
export async function getTVShowDetails(tvId: string) {
  return fetchFromTMDB(`/tv/${tvId}`, {
    append_to_response: "credits,videos,images,recommendations,reviews,keywords",
  })
}

/**
 * Get movie genres
 */
export async function getMovieGenres() {
  return fetchFromTMDB("/genre/movie/list") as Promise<GenreResponse>
}

/**
 * Get TV genres
 */
export async function getTVGenres() {
  return fetchFromTMDB("/genre/tv/list") as Promise<GenreResponse>
}

/**
 * Search for movies
 */
export async function searchMovies(query: string, page = 1) {
  return fetchFromTMDB("/search/movie", {
    query,
    page: page.toString(),
    include_adult: "false",
  }) as Promise<MovieResponse>
}

/**
 * Search for TV shows
 */
export async function searchTVShows(query: string, page = 1) {
  return fetchFromTMDB("/search/tv", {
    query,
    page: page.toString(),
    include_adult: "false",
  }) as Promise<TVResponse>
}

/**
 * Search for people
 */
export async function searchPeople(query: string, page = 1) {
  return fetchFromTMDB("/search/person", {
    query,
    page: page.toString(),
    include_adult: "false",
  }) as Promise<PersonResponse>
}

/**
 * Multi-search (movies, TV shows, people)
 */
export async function multiSearch(query: string, page = 1) {
  return fetchFromTMDB("/search/multi", {
    query,
    page: page.toString(),
    include_adult: "false",
  }) as Promise<MediaResponse>
}

/**
 * Get movie videos
 */
export async function getMovieVideos(movieId: string) {
  return fetchFromTMDB(`/movie/${movieId}/videos`) as Promise<VideosResponse>
}

/**
 * Get TV show videos
 */
export async function getTVShowVideos(tvId: string) {
  return fetchFromTMDB(`/tv/${tvId}/videos`) as Promise<VideosResponse>
}

