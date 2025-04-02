import { NextResponse } from "next/server"
import { getMovieVideos } from "@/lib/tmdb"

export async function GET(request: Request, { params }: any) {
  try {
    const videos = await getMovieVideos(params.id)
    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error fetching movie videos:", error)
    return NextResponse.json({ error: "Failed to fetch movie videos" }, { status: 500 })
  }
}

