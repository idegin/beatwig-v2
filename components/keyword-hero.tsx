"use client"

import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"
import { KeywordResponse } from "@/lib/tmdb"

interface KeywordHeroProps {
    keyword: KeywordResponse
}

export function KeywordHero({ keyword }: KeywordHeroProps) {
    return (
        <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-background" />
            
            <div className="relative flex justify-center">
                <div className="container py-20 md:py-32">
                    <div className="flex flex-col items-center text-center space-y-6">
                        {/* Icon */}
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/20">
                            <Tag className="w-10 h-10 text-primary" />
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-primary/20">
                                Keyword
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                                {keyword.name}
                            </h1>
                        </div>

                        {/* Description */}
                        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                            Explore movies and TV shows tagged with <span className="font-semibold text-primary">"{keyword.name}"</span>. 
                            Discover content related to this theme and find your next watch.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
