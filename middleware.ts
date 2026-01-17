import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_COOKIE_NAME = "beatwig-auth-token"

const protectedRoutes = ["/for-you", "/watchlist"]
const authRedirectRoutes = ["/"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  )
  const isAuthRedirectRoute = authRedirectRoutes.includes(pathname)

  if (isAuthRedirectRoute && token) {
    return NextResponse.redirect(new URL("/for-you", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/for-you/:path*",
    "/watchlist/:path*",
  ],
}
