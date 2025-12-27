import { NextRequest, NextResponse } from "next/server"
import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from "@/app/constants"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const genreId = searchParams.get("genreId")
  const mediaType = searchParams.get("mediaType") || "movie"
  const page = searchParams.get("page") || "1"

  if (!genreId) {
    return NextResponse.json(
      { error: "Missing genreId parameter" },
      { status: 400 }
    )
  }

  try {
    const endpoint = mediaType === "tv" ? "/discover/tv" : "/discover/movie"
    const response = await fetch(
      `${TMDB_BASE_URL}${endpoint}?with_genres=${genreId}&page=${page}&sort_by=popularity.desc&include_adult=false&language=en-US`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
      }
    )

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`)
    }

    const data = await response.json()

    const results = data.results.map((film: Record<string, unknown>) => ({
      ...film,
      media_type: mediaType,
    }))

    return NextResponse.json({
      results,
      total_pages: data.total_pages || 0,
      total_results: data.total_results || 0,
      page: data.page || 1,
    })
  } catch (error) {
    console.error("Genre API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch genre films" },
      { status: 500 }
    )
  }
}
