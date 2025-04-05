"use client"

import { usePathname, useSearchParams } from "next/navigation";
import {useRouter} from 'next13-progressbar'
import type { Genre } from "@/lib/tmdb"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Film, Tv } from "lucide-react"
import {getGenreColor} from "@/lib/utils";

interface GenreHeroProps {
    genre: Genre
    mediaType: "movie" | "tv"
}

export function GenreHero({ genre, mediaType }: GenreHeroProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("type", value)
        params.delete("page")
        router.push(`${pathname}?${params.toString()}`)
    }



    return (
        <div className={`relative pt-16 pb-8 md:pt-24 md:pb-12 bg-gradient-to-b flex justify-center ${getGenreColor(genre.name)}`}>
            <div className="container">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{genre.name}</h1>

                <p className="text-xl text-muted-foreground mb-8">
                    Explore {mediaType === "tv" ? "TV shows" : "movies"} in the {genre.name} genre
                </p>

                <Tabs value={mediaType} onValueChange={handleTabChange} className="w-full">
                    <TabsList>
                        <TabsTrigger value="movie" className="flex items-center gap-2">
                            <Film className="h-4 w-4" />
                            Movies
                        </TabsTrigger>
                        <TabsTrigger value="tv" className="flex items-center gap-2">
                            <Tv className="h-4 w-4" />
                            TV Shows
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    )
}

