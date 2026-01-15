"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft, Film } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 size-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 size-64 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <div className="text-[180px] md:text-[220px] font-bold text-primary/10 select-none leading-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-24 md:size-32 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/30">
                <Film className="size-12 md:size-16 text-primary" />
              </div>
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like this content has gone off-script. The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="gap-2 rounded-full px-8">
            <Link href="/">
              <Home className="size-5" />
              Go Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="gap-2 rounded-full px-8">
            <Link href="/search">
              <Search className="size-5" />
              Search Content
            </Link>
          </Button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-4">
            Popular destinations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/movies">Movies</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/tv-shows">TV Shows</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/watchlist">Watchlist</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
