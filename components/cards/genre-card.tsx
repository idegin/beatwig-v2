"use client"

import Link from "next/link"
import { Genre } from "@/types/tmdb.types"

interface GenreCardProps {
    genre: Genre
    size?: "default" | "large"
}

const genreColors: Record<number, string> = {
    28: "from-red-600 to-orange-600",
    12: "from-emerald-600 to-teal-600",
    16: "from-purple-600 to-pink-600",
    35: "from-yellow-500 to-orange-500",
    80: "from-slate-700 to-slate-900",
    99: "from-blue-600 to-cyan-600",
    18: "from-indigo-600 to-purple-600",
    10751: "from-pink-500 to-rose-500",
    14: "from-violet-600 to-purple-600",
    36: "from-amber-700 to-yellow-700",
    27: "from-gray-900 to-red-900",
    10402: "from-fuchsia-600 to-pink-600",
    9648: "from-slate-800 to-indigo-900",
    10749: "from-rose-500 to-pink-500",
    878: "from-cyan-600 to-blue-600",
    10770: "from-orange-600 to-red-600",
    53: "from-gray-800 to-slate-900",
    10752: "from-green-800 to-emerald-900",
    37: "from-amber-600 to-yellow-700",
}

export function GenreCard({ genre, size = "default" }: GenreCardProps) {
    const gradientClass = genreColors[genre.id] || "from-primary to-primary/80"

    return (
        <Link
            href={`/genre/${genre.id}?type=movie`}
            className="group block"
        >
            <div
                className={`relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-2xl ${size === "large" ? "aspect-video" : "aspect-[16/10]"
                    }`}
            >
                {genre.image ? (
                    <img
                        src={genre.image}
                        alt={genre.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradientClass}`} />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <h3
                        className={`font-bold text-white text-center drop-shadow-lg transition-transform duration-300 group-hover:scale-110 ${size === "large" ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
                            }`}
                    >
                        {genre.name}
                    </h3>
                </div>

                <div className="absolute inset-0 border-2 border-white/0 rounded-xl transition-all duration-300 group-hover:border-white/30" />

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
        </Link>
    )
}
