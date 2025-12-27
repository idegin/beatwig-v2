
export interface Film {
  id: number
  adult: boolean
  backdrop_path: string | null
  genre_ids: number[]
  original_language: string
  original_title?: string
  original_name?: string
  overview: string
  popularity: number
  poster_path: string | null
  release_date?: string
  first_air_date?: string
  title?: string
  name?: string
  video?: boolean
  vote_average: number
  vote_count: number
  media_type?: "movie" | "tv"
}

export interface Genre {
  id: number
  name: string
  image?: string
}

export interface Person {
  id: number
  name: string
  profile_path: string | null
  known_for_department: string
  popularity: number
}

export interface Collection {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
}

export interface Company {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

export interface Keyword {
  id: number
  name: string
}

export interface Network {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
  image?: string
}

export interface Review {
  id: string
  author: string
  content: string
  created_at: string
  updated_at: string
  url: string
}

export interface AlternativeTitle {
  iso_3166_1: string
  title: string
  type: string
}

export interface Translation {
  iso_639_1: string
  iso_3166_1: string
  name: string
  english_name: string
}

export interface Video {
  id: string
  iso_639_1: string
  iso_3166_1: string
  key: string
  name: string
  site: string
  size: number
  type: string
  official: boolean
  published_at: string
}

export interface Image {
  aspect_ratio: number
  file_path: string
  height: number
  width: number
  vote_average: number
  vote_count: number
}

export interface AccountState {
  id: number
  favorite: boolean
  rated: boolean | { value: number }
  watchlist: boolean
}

export interface WatchProvider {
  display_priority: number
  logo_path: string
  provider_id: number
  provider_name: string
}

export interface FilmDetails<T> {
  film: T
}

export interface HeroData {
  id: number
  title: string
  overview: string
  backdrop_path: string
  poster_path: string
  release_date: string
  vote_average: number
  genres: string[]
  runtime?: number
  certification?: string
  media_type: "movie" | "tv"
  video_key?: string
}