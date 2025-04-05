export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

export const POSTER_SIZES = {
  SMALL: "w185",
  MEDIUM: "w342",
  LARGE: "w500",
  ORIGINAL: "original",
}

export const BACKDROP_SIZES = {
  SMALL: "w300",
  MEDIUM: "w780",
  LARGE: "w1280",
  ORIGINAL: "original",
}

export const PROFILE_SIZES = {
  SMALL: "w45",
  MEDIUM: "w185",
  LARGE: "h632",
  ORIGINAL: "original",
}

export const SITE_NAME = "BeatWig"
export const SITE_DESCRIPTION = "Stream Movies and TV Shows Online"

export const MEDIA_TYPES = {
  MOVIE: "movie",
  TV: "tv",
  PERSON: "person",
}

export const WATCH_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
}

// Progress thresholds
export const PROGRESS_THRESHOLDS = {
  COMPLETED: 90, // Progress >= 90% is considered complete
  STARTED: 3,    // Progress >= 3% is considered started
}

// Watch history constants
export const WATCH_HISTORY = {
  SAVE_INTERVAL: process.env.NODE_ENV === 'production' ? 60000: 10000, // Save progress every 10 seconds
  DEFAULT_MOVIE_DURATION: 120, // Default movie duration in minutes
  DEFAULT_EPISODE_DURATION: 45, // Default TV episode duration in minutes
  HOME_DISPLAY_LIMIT: 6, // Number of watch history items to display on home page
}
