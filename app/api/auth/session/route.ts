import { NextResponse } from "next/server"
import { setAuthCookie } from "@/lib/auth-cookies"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      )
    }

    await setAuthCookie(token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting auth session:", error)
    return NextResponse.json(
      { error: "Failed to set session" },
      { status: 500 }
    )
  }
}
