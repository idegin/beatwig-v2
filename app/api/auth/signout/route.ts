import { NextResponse } from "next/server"
import { removeAuthCookie } from "@/lib/auth-cookies"

export async function POST() {
  try {
    await removeAuthCookie()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error signing out:", error)
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    )
  }
}
