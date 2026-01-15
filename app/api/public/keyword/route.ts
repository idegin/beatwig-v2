import { NextRequest, NextResponse } from "next/server"
import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from "@/app/constants"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const keywordId = searchParams.get("keywordId")
  const page = searchParams.get("page") || "1"

  if (!keywordId) {
    return NextResponse.json(
      { error: "Missing keywordId parameter" },
      { status: 400 }
    )
  }

  try {
    const [keywordResponse, moviesResponse] = await Promise.all([
      fetch(
        `${TMDB_BASE_URL}/keyword/${keywordId}?language=en-US`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          next: { revalidate: 86400 },
        }
      ),
      fetch(
        `${TMDB_BASE_URL}/discover/movie?with_keywords=${keywordId}&page=${page}&sort_by=popularity.desc&include_adult=false&language=en-US`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          next: { revalidate: 3600 },
        }
      ),
    ])

    if (!keywordResponse.ok || !moviesResponse.ok) {
      throw new Error(`TMDB API error`)
    }

    const [keywordData, moviesData] = await Promise.all([
      keywordResponse.json(),
      moviesResponse.json(),
    ])

    const results = moviesData.results.map((film: Record<string, unknown>) => ({
      ...film,
      media_type: "movie",
    }))

    return NextResponse.json({
      keyword: keywordData,
      results,
      total_pages: moviesData.total_pages || 0,
      total_results: moviesData.total_results || 0,
      page: moviesData.page || 1,
    })
  } catch (error) {
    console.error("Keyword API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch keyword films" },
      { status: 500 }
    )
  }
}
