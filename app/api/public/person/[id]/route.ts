import { NextRequest, NextResponse } from "next/server"
import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from "@/app/constants"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: "Missing person ID" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/person/${id}?append_to_response=combined_credits,images&language=en-US`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch person details" },
        { status: response.status }
      )
    }

    const data = await response.json()

    const movieCredits = data.combined_credits?.cast || []
    const crewCredits = data.combined_credits?.crew || []

    const allCredits = [...movieCredits, ...crewCredits]
    const uniqueCredits = allCredits.reduce((acc: typeof allCredits, credit) => {
      if (!acc.find((c) => c.id === credit.id && c.media_type === credit.media_type)) {
        acc.push(credit)
      }
      return acc
    }, [])

    const sortedCredits = uniqueCredits
      .filter((c) => c.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

    const formattedCredits = sortedCredits.map((credit) => ({
      id: credit.id,
      title: credit.title || credit.name,
      name: credit.name || credit.title,
      overview: credit.overview,
      poster_path: credit.poster_path,
      backdrop_path: credit.backdrop_path,
      release_date: credit.release_date || credit.first_air_date,
      first_air_date: credit.first_air_date,
      vote_average: credit.vote_average || 0,
      genre_ids: credit.genre_ids || [],
      media_type: credit.media_type,
      character: credit.character,
      job: credit.job,
    }))

    return NextResponse.json({
      id: data.id,
      name: data.name,
      biography: data.biography,
      birthday: data.birthday,
      deathday: data.deathday,
      place_of_birth: data.place_of_birth,
      profile_path: data.profile_path,
      known_for_department: data.known_for_department,
      popularity: data.popularity,
      credits: formattedCredits,
      totalCredits: formattedCredits.length,
    })
  } catch (error) {
    console.error("Error fetching person:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
