export const appData = {
    name: "BeatWig",
}
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
export const TMDB_ACCESS_TOKEN = process.env.TMDB_API_KEY
export const TMDB_BASE_URL = "https://api.themoviedb.org/3"

export const FIREBASE_COLLECTIONS = {
    USERS: "users",
    FILM_BOOKMARKS: "film_bookmarks",
    MESSAGES: "messages",
    WATCH_HISTORY: "watch_history",
    WATCHLIST: "watchlist",
} as const