import { revalidatePath } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

// This route is used to revalidate the cache for specific paths
// It can be called from a webhook or manually to refresh data
export async function POST(request: NextRequest) {
  try {
    const { path, secret } = await request.json()

    // Validate the request
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 })
    }

    if (!path) {
      return NextResponse.json({ message: "Path is required" }, { status: 400 })
    }

    // Revalidate the path
    revalidatePath(path)

    return NextResponse.json({ revalidated: true, message: `Path ${path} revalidated` })
  } catch (error) {
    return NextResponse.json({ message: "Error revalidating", error }, { status: 500 })
  }
}

