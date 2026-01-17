"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { Loader2, Lock, Play, Bookmark, Download, Sparkles } from "lucide-react"

interface AuthPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  feature?: "watchlist" | "download" | "general"
}

export function AuthPopup({
  open,
  onOpenChange,
  title = "Sign in to continue",
  description = "Create a free account to unlock all features",
  feature = "general",
}: AuthPopupProps) {
  const { signInWithGoogle, authState } = useAuth()
  const [isSigningIn, setIsSigningIn] = React.useState(false)

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
      onOpenChange(false)
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsSigningIn(false)
    }
  }

  const featureIcons = {
    watchlist: <Bookmark className="size-6 text-primary" />,
    download: <Download className="size-6 text-primary" />,
    general: <Lock className="size-6 text-primary" />,
  }

  const featureTitles = {
    watchlist: "Save to Your Watchlist",
    download: "Download for Offline",
    general: title,
  }

  const featureDescriptions = {
    watchlist: "Sign in to save movies and TV shows to watch later",
    download: "Sign in to download content for offline viewing",
    general: description,
  }

  const features = [
    { icon: <Bookmark className="size-5" />, text: "Build your watchlist" },
    { icon: <Play className="size-5" />, text: "Track your progress" },
    { icon: <Sparkles className="size-5" />, text: "Get personalized recommendations" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background border-border/50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent" />
          
          <div className="relative p-6 pt-8">
            <DialogHeader className="text-center space-y-4">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                {featureIcons[feature]}
              </div>
              <DialogTitle className="text-2xl font-bold">
                {featureTitles[feature]}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {featureDescriptions[feature]}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-8 space-y-4">
              <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {f.icon}
                    </div>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleSignIn}
                disabled={isSigningIn || authState.loading}
                className="w-full h-14 gap-3 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      width={20}
                      height={20}
                      className="rounded-sm"
                    />
                    Continue with Google
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-2">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
