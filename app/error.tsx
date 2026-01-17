"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, RefreshCw, AlertTriangle, Bug } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-destructive/5 via-background to-background" />
      <div className="absolute top-1/3 left-1/3 size-80 bg-destructive/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 size-64 bg-destructive/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <div className="size-32 md:size-40 rounded-full bg-destructive/10 flex items-center justify-center backdrop-blur-sm border border-destructive/20 animate-pulse">
              <AlertTriangle className="size-16 md:size-20 text-destructive" />
            </div>
            <div className="absolute -bottom-2 -right-2 size-12 rounded-full bg-background border border-border flex items-center justify-center">
              <Bug className="size-6 text-muted-foreground" />
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Something Went Wrong
        </h1>
        
        <p className="text-lg text-muted-foreground mb-4 max-w-md mx-auto">
          We encountered an unexpected error while loading this page. Our team has been notified.
        </p>

        {error.digest && (
          <p className="text-sm text-muted-foreground/70 mb-8 font-mono bg-muted/30 rounded-lg px-4 py-2 inline-block">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Button 
            onClick={reset} 
            size="lg" 
            className="gap-2 rounded-full px-8"
          >
            <RefreshCw className="size-5" />
            Try Again
          </Button>
          
          <Button asChild variant="outline" size="lg" className="gap-2 rounded-full px-8">
            <Link href="/">
              <Home className="size-5" />
              Go Home
            </Link>
          </Button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            If this problem persists, please try clearing your browser cache or contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
