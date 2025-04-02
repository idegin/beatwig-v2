import { NextResponse } from "next/server"
import { getTVShowDetails, getTVShowSeasonDetails } from "@/lib/tmdb"

export async function GET(request: Request, { params }: any) {
    try {
        // Instead of using getTVShowSeasons, let's get the TV show details
        // which includes the seasons array
        const tvDetails = await getTVShowDetails(params.id)
        return NextResponse.json(tvDetails.seasons || [])
    } catch (error) {
        console.error("Error fetching TV seasons:", error)
        return NextResponse.json({ error: "Failed to fetch TV seasons" }, { status: 500 })
    }
}

export async function POST(request: Request, { params }: any) {
    try {
        const { seasonNumber } = await request.json()

        if (typeof seasonNumber !== 'number') {
            return NextResponse.json(
                { error: "Season number is required and must be a number" },
                { status: 400 }
            )
        }

        const seasonDetails = await getTVShowSeasonDetails(params.id, seasonNumber)
        return NextResponse.json(seasonDetails)
    } catch (error) {
        console.error("Error fetching season episodes:", error)
        return NextResponse.json({ error: "Failed to fetch season episodes" }, { status: 500 })
    }
}
