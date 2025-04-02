/**
 * Base function to fetch data from TMDB API
 */
const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

export async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({
    language: "en-US",
    ...params,
  })

  const url = `${TMDB_BASE_URL}${endpoint}?${queryParams}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 * 60 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error(`TMDB API error: ${response.status} ${response.statusText} for ${endpoint}`)
      return { results: [] }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching from TMDB (${endpoint}):`, error)
    // Return empty results to prevent the app from crashing
    return { results: [] }
  }
}

