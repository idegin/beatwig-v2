"use client"

import * as React from "react"
import { X, Sparkles, Play, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface RecommendationBannerProps {
  className?: string
}

export function RecommendationBanner({ className }: RecommendationBannerProps) {
  const [isDismissed, setIsDismissed] = React.useState(false)
  const [hasCheckedStorage, setHasCheckedStorage] = React.useState(false)

  React.useEffect(() => {
    const dismissed = localStorage.getItem("recommendation-banner-dismissed")
    if (dismissed) {
      setIsDismissed(true)
    }
    setHasCheckedStorage(true)
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem("recommendation-banner-dismissed", "true")
  }

  if (!hasCheckedStorage || isDismissed) {
    return null
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl mx-4 md:mx-8 lg:mx-12 mt-4 mb-2",
        "bg-linear-to-r from-primary/20 via-primary/10 to-purple-500/20",
        "border border-primary/20",
        className
      )}
    >
      <div className="absolute inset-0 bg-linear-to-br from-black/40 to-transparent" />
      
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
      
      <div className="relative px-6 py-8 md:px-10 md:py-10">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-linear-to-br from-primary to-purple-600 shadow-lg shadow-primary/25">
            <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>

          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold text-foreground">
                Your Personalized Experience Awaits
              </h3>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                The more you watch, the better we get at recommending movies and shows you&apos;ll love. 
                Start exploring to unlock personalized recommendations tailored just for you.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Play className="h-4 w-4 text-primary" />
                <span>Watch content you enjoy</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Get smarter recommendations</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button asChild size="lg" className="font-semibold">
              <Link href="/for-you">
                <Sparkles className="h-4 w-4 mr-2" />
                Explore For You
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleDismiss}
              className="font-medium"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
