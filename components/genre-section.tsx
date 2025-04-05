import Link from "next/link"
import type {Genre} from "@/lib/tmdb"
import {getGenreColor} from "@/lib/utils"
import {cn} from "@/lib/utils"
import { ArrowRight } from "lucide-react"

interface GenreSectionProps {
    title: string
    genres: Genre[]
    type?: "movie" | "tv"
}

export function GenreSection({title, genres, type = "movie"}: GenreSectionProps) {
    if (!genres || genres.length === 0) return null

    return (
        <section className="py-8 media-section flex justify-center select-none">
            <div className="container">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                    {/*<Link */}
                    {/*    href="/genres" */}
                    {/*    className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"*/}
                    {/*>*/}
                    {/*    View all genres*/}
                    {/*    <ArrowRight className="h-4 w-4" />*/}
                    {/*</Link>*/}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {genres.map((genre) => (
                        <Link
                            key={genre.id}
                            href={`/genre/${genre.id}`}
                            className={cn(
                                "block p-4 rounded-lg bg-gradient-to-br transition-all duration-300",
                                "hover:shadow-lg hover:scale-[1.02] hover:opacity-90",
                                "border border-background/10",
                                "flex items-center justify-center h-[100px]",
                                getGenreColor(genre.name)
                            )}
                        >
                            <span className="text-lg font-semibold text-center text-foreground drop-shadow-sm">
                                {genre.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
