import { NextRequest, NextResponse } from "next/server"
import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from "@/app/constants"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const genreId = searchParams.get("genreId")
  const mediaType = searchParams.get("mediaType") || "movie"
  const limit = parseInt(searchParams.get("limit") || "12")

  if (!genreId) {
    return NextResponse.json(
      { error: "Missing genreId parameter" },
      { status: 400 }
    )
  }

  try {
    const endpoint = mediaType === "tv" ? "/discover/tv" : "/discover/movie"
    const randomPage = Math.floor(Math.random() * 5) + 1
    
    const response = await fetch(
      `${TMDB_BASE_URL}${endpoint}?with_genres=${genreId}&page=${randomPage}&sort_by=popularity.desc&include_adult=false&language=en-US`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 1800 },
      }
    )

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`)
    }

    const data = await response.json()

    const films = data.results.slice(0, limit).map((film: Record<string, unknown>) => ({
      ...film,
      media_type: mediaType,
    }))

    return NextResponse.json({ films })
  } catch (error) {
    console.error("Genre films API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch genre films", films: [] },
      { status: 500 }
    )
  }
}
