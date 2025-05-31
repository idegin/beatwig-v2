import type React from "react"
import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/footer"
import { GoogleAnalytics } from "@/components/google-analytics"
import { cn } from "@/lib/utils"
import "@/app/globals.css"


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "BeatWig - Watch Movies and TV Shows Online",
  description: "Discover the latest movies and TV shows. Watch trailers, find ratings, and get recommendations for what to watch next.",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", poppins.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
            {/*<Footer />*/}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

