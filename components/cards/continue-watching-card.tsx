"use client"

import { Play, Film, Tv } from "lucide-react"
import { ContinueWatchingItem } from "@/types/firebase.types"

interface ContinueWatchingCardProps {
    item: ContinueWatchingItem
}

export function ContinueWatchingCard({ item }: ContinueWatchingCardProps) {
    return (
        <div className="group relative flex-shrink-0 w-[280px] md:w-[320px] rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-xl cursor-pointer">
            <div className="relative aspect-video overflow-hidden">
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                        {item.type === "movie" ? (
                            <Film className="size-3" />
                        ) : (
                            <Tv className="size-3" />
                        )}
                        {item.type === "movie" ? "Movie" : "TV Show"}
                    </span>
                    <span className="rounded-md bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                        {item.rating}
                    </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="size-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30">
                        <Play className="size-6 text-primary-foreground fill-current ml-0.5" />
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <div className="h-1 bg-muted-foreground/30">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${item.progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0">
                        {item.duration}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.year}</span>
                    {item.type === "tv" && (
                        <>
                            <span>•</span>
                            <span>
                                S{item.season} E{item.episode}
                            </span>
                        </>
                    )}
                    <span>•</span>
                    <span>{item.progress}% watched</span>
                </div>
            </div>
        </div>
    )
}
