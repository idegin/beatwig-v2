import { NextRequest, NextResponse } from "next/server"
import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from "@/app/constants"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const page = searchParams.get("page") || "1"

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter" },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}&include_adult=false&language=en-US`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 },
      }
    )

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      results: data.results || [],
      total_pages: data.total_pages || 0,
      total_results: data.total_results || 0,
      page: data.page || 1,
    })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 }
    )
  }
}
