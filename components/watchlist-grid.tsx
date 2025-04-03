"use client"

import { useState } from "react"
import { WatchlistCard } from "@/components/watchlist-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Film, Tv } from "lucide-react"
import { WatchlistItem, removeFromWatchlist } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface WatchlistGridProps {
    items: WatchlistItem[]
}

export function WatchlistGrid({ items }: WatchlistGridProps) {
    const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>(items)
    const { toast } = useToast()

    const movieItems = watchlistItems.filter((item) => item.media_type === "movie")
    const tvItems = watchlistItems.filter((item) => item.media_type === "tv")

    const handleRemoveFromWatchlist = async (id: number) => {
        try {
            const result = await removeFromWatchlist(id)
            
            if (result.success) {
                setWatchlistItems((prev) => prev.filter((item) => item.id !== id))
                toast({
                    title: "Item removed",
                    description: result.message,
                })
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error removing from watchlist:", error)
            toast({
                title: "Error",
                description: "Failed to remove item from watchlist",
                variant: "destructive",
            })
        }
    }

    if (watchlistItems.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold mb-4">Your watchlist is empty</h2>
                <p className="text-muted-foreground mb-6">
                    Add movies and TV shows to your watchlist to keep track of what you want to watch.
                </p>
                <Button asChild>
                    <Link href="/">Browse Movies & TV Shows</Link>
                </Button>
            </div>
        )
    }

    return (
        <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-8">
                <TabsTrigger value="all">All ({watchlistItems.length})</TabsTrigger>
                <TabsTrigger value="movies" className="flex items-center gap-2">
                    <Film className="h-4 w-4" />
                    Movies ({movieItems.length})
                </TabsTrigger>
                <TabsTrigger value="tvshows" className="flex items-center gap-2">
                    <Tv className="h-4 w-4" />
                    TV Shows ({tvItems.length})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {watchlistItems.map((item) => (
                        <WatchlistCard
                            key={`${item.media_type}-${item.id}`}
                            media={item}
                            onRemove={() => handleRemoveFromWatchlist(item.id)}
                        />
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="movies">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {movieItems.map((item) => (
                        <WatchlistCard
                            key={`${item.media_type}-${item.id}`}
                            media={item}
                            onRemove={() => handleRemoveFromWatchlist(item.id)}
                        />
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="tvshows">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {tvItems.map((item) => (
                        <WatchlistCard
                            key={`${item.media_type}-${item.id}`}
                            media={item}
                            onRemove={() => handleRemoveFromWatchlist(item.id)}
                        />
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    )
}
