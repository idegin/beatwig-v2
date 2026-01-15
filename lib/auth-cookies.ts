import { cookies } from "next/headers"

export const AUTH_COOKIE_NAME = "beatwig-auth-token"
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 5 // 5 days

export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null
    console.log("[getAuthToken] Token:", token ? "present" : "missing")
    return token
  } catch (error) {
    console.error("[getAuthToken] Error:", error)
    return null
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
  })
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}
