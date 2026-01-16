export interface ContinueWatchingItem {
  id: string
  title: string
  type: "movie" | "tv"
  image: string
  progress: number
  duration: string
  episode?: number
  season?: number
  year: number
  rating: string
}

export interface WatchHistoryItem {
  id: string
  odid: string
  userId: string
  filmId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  releaseDate: string
  runtime: number | null
  progress: number
  progressSeconds: number
  season?: number
  episode?: number
  episodeTitle?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  watchlist: string[]
  continueWatching: ContinueWatchingItem[]
}

export interface AlgorithmItem {
  id: number
  mediaType: "movie" | "tv"
  image: string
  backdropPath: string | null
  country: string
  title: string
  tags: string[]
  genreIds: number[]
  genres: { id: number; name: string }[]
  rank: number
  interactionCount: number
  watchDurationPercent: number
  voteAverage: number
  popularity: number
  originalLanguage: string
  releaseDate: string
  lastWatchedAt: Date
  lastInteractedAt: Date
}

export interface AlgorithmGenre {
  id: number
  name: string
  rank: number
  lastInteractedAt: Date
}

export interface AlgorithmTag {
  name: string
  rank: number
  lastInteractedAt: Date
}

export interface UserAlgorithm {
  userId: string
  items: AlgorithmItem[]
  genres: AlgorithmGenre[]
  tags: AlgorithmTag[]
  createdAt: Date
  updatedAt: Date
}
