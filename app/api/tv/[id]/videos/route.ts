import { NextResponse } from "next/server"
import { getTVShowVideos } from "@/lib/tmdb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const videos = await getTVShowVideos(params.id)
    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error fetching TV videos:", error)
    return NextResponse.json({ error: "Failed to fetch TV videos" }, { status: 500 })
  }
}

