import { NextRequest, NextResponse } from "next/server"
import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from "@/app/constants"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get("keyword")
  const limit = parseInt(searchParams.get("limit") || "12")

  if (!keyword) {
    return NextResponse.json(
      { error: "Missing keyword parameter" },
      { status: 400 }
    )
  }

  try {
    const searchResponse = await fetch(
      `${TMDB_BASE_URL}/search/keyword?query=${encodeURIComponent(keyword)}&language=en-US`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 86400 },
      }
    )

    if (!searchResponse.ok) {
      throw new Error(`TMDB API error: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()

    if (!searchData.results || searchData.results.length === 0) {
      return NextResponse.json({ films: [] })
    }

    const keywordId = searchData.results[0].id
    const randomPage = Math.floor(Math.random() * 3) + 1

    const moviesResponse = await fetch(
      `${TMDB_BASE_URL}/discover/movie?with_keywords=${keywordId}&page=${randomPage}&sort_by=popularity.desc&include_adult=false&language=en-US`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 1800 },
      }
    )

    if (!moviesResponse.ok) {
      throw new Error(`TMDB API error: ${moviesResponse.status}`)
    }

    const moviesData = await moviesResponse.json()

    const films = moviesData.results.slice(0, limit).map((film: Record<string, unknown>) => ({
      ...film,
      media_type: "movie",
    }))

    return NextResponse.json({ films, keyword })
  } catch (error) {
    console.error("Keyword films API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch keyword films", films: [] },
      { status: 500 }
    )
  }
}
