import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This middleware runs on every request
export function middleware(request: NextRequest) {
  // Add security headers
  const headers = new Headers(request.headers)

  // Content Security Policy
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.youtube.com *.youtu.be; frame-src *.youtube.com *.youtu.be; img-src 'self' data: *.tmdb.org; style-src 'self' 'unsafe-inline'; font-src 'self' data:;",
  )

  // Other security headers
  headers.set("X-XSS-Protection", "1; mode=block")
  headers.set("X-Frame-Options", "SAMEORIGIN")
  headers.set("X-Content-Type-Options", "nosniff")
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  return NextResponse.next({
    request: {
      headers,
    },
  })
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

