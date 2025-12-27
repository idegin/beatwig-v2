import { NextRequest, NextResponse } from "next/server"
import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from "@/app/constants"

interface Episode {
  id: number
  name: string
  overview: string
  episode_number: number
  season_number: number
  still_path: string | null
  air_date: string
  runtime: number | null
  vote_average: number
  watchProgress?: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const showId = searchParams.get("showId")
  const seasonNumber = searchParams.get("season")

  if (!showId || !seasonNumber) {
    return NextResponse.json(
      { error: "Missing showId or season parameter" },
      { status: 400 }
    )
  }

  const showIdNum = parseInt(showId)
  const seasonNum = parseInt(seasonNumber)

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${showIdNum}/season/${seasonNum}?language=en-US`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
      }
    )

    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`)
    }

    const data = await response.json()
    const episodes: Episode[] = (data.episodes || []).map((ep: Record<string, unknown>) => ({
      id: ep.id,
      name: ep.name,
      overview: ep.overview || "",
      episode_number: ep.episode_number,
      season_number: ep.season_number,
      still_path: ep.still_path,
      air_date: ep.air_date || "",
      runtime: ep.runtime,
      vote_average: ep.vote_average || 0,
    }))

    return NextResponse.json({ episodes })
  } catch (error) {
    console.error("Error fetching episodes:", error)
    return NextResponse.json({ episodes: [] })
  }
}
