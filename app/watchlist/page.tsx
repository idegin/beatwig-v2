'use client'

import { SiteHeader } from "@/components/site-header"
import { WatchlistGrid } from "@/components/watchlist-grid"
import { WatchlistSkeleton } from "@/components/watchlist-skeleton"
import { useEffect, useState } from "react"
import { getUserWatchlist } from "@/lib/firebase"
import { useAuth } from "@/context/auth.context"
import { Button } from "@/components/ui/button"
import { LogIn, Loader2 } from "lucide-react"
import type { WatchlistItem } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

export default function WatchlistPage() {
    const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSigningIn, setIsSigningIn] = useState(false)
    const { user, loading: authLoading, googleSignIn } = useAuth()
    const { toast } = useToast()

    useEffect(() => {
        const fetchWatchlist = async () => {
            if (authLoading) return
            
            if (user) {
                setIsLoading(true)
                try {
                    const items = await getUserWatchlist()
                    setWatchlistItems(items)
                } catch (error) {
                    console.error("Error fetching watchlist:", error)
                } finally {
                    setIsLoading(false)
                }
            } else {
                setIsLoading(false)
            }
        }

        fetchWatchlist()
    }, [user, authLoading])

    const handleSignIn = async () => {
        setIsSigningIn(true)
        try {
            await googleSignIn()
            // No need to show success toast as the page will refresh with watchlist content
        } catch (error) {
            console.error("Sign in error:", error)
            toast({
                title: "Authentication failed",
                description: "There was a problem signing you in. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsSigningIn(false)
        }
    }

    return (
        <>
            <SiteHeader />
            <div className={'flex justify-center'}>
                <div className="container pt-40 pb-40">
                    <h1 className="text-3xl font-bold mb-2">Your Watchlist</h1>
                    <p className="text-muted-foreground mb-8">Movies and TV shows you want to watch later</p>

                    {!user && !authLoading && (
                        <div className="text-center py-20">
                            <h2 className="text-2xl font-semibold mb-4">Sign in to view your watchlist</h2>
                            <p className="text-muted-foreground mb-6">
                                You need to be signed in to manage and view your watchlist.
                            </p>
                            <Button onClick={handleSignIn} disabled={isSigningIn}>
                                {isSigningIn ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Sign in with Google
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {user && isLoading ? (
                        <WatchlistSkeleton />
                    ) : (
                        user && <WatchlistGrid items={watchlistItems} />
                    )}
                </div>
            </div>
        </>
    )
}
