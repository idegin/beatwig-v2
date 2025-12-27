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

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  watchlist: string[]
  continueWatching: ContinueWatchingItem[]
}
