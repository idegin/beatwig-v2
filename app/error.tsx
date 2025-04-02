"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-destructive">Error</h1>
      <h2 className="mt-4 text-2xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-muted-foreground">An unexpected error occurred. Please try again later.</p>
      <Button onClick={reset} className="mt-8">
        Try Again
      </Button>
    </div>
  )
}

