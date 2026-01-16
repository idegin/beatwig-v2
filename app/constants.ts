import { Genre } from "@/types/tmdb.types";

export const appData = {
    name: "BeatWig",
}
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
export const TMDB_ACCESS_TOKEN = process.env.TMDB_API_KEY
export const TMDB_BASE_URL = "https://api.themoviedb.org/3"

export const FIREBASE_COLLECTIONS = {
    USERS: "users",
    WATCH_HISTORY: "watch_history",
    WATCHLIST: "watchlist",
    ALGORITHM: "algorithm",
} as const

export const WATCH_HISTORY_THRESHOLD_SECONDS = 
    process.env.NODE_ENV === "development" ? 5 : 120

export const PROGRESS_UPDATE_INTERVAL_SECONDS = 
    process.env.NODE_ENV === "development" ? 30 : 300

export const ALGORITHM_UPDATE_INTERVAL_SECONDS =
    process.env.NODE_ENV === "development" ? 60 : 600

export const MAX_ALGORITHM_ITEMS = 10
export const MAX_ALGORITHM_GENRES = 15
export const MAX_ALGORITHM_TAGS = 20

export const TV_EPISODE_RANK_MULTIPLIER = 0.15
export const TV_BASE_RANK_CAP = 3
export const MOVIE_BASE_RANK = 1

export const ALGORITHM_RECENCY_DECAY_DAYS = 30
export const ALGORITHM_RECENCY_WEIGHT = 0.3
export const ALGORITHM_RANK_WEIGHT = 0.5
export const ALGORITHM_DIVERSITY_WEIGHT = 0.2

export const TAG_FREQUENCY_BOOST = 0.5
export const TAG_RECENCY_WEIGHT = 0.4

export const FOR_YOU_DIVERSITY_THRESHOLD = 0.6
export const FOR_YOU_MAX_SAME_GENRE = 2



