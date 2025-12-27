"use client"

import Link from "next/link"
import { Play } from "lucide-react"
import { Film } from "@/types/tmdb.types"
import { TMDB_IMAGE_BASE } from "@/app/constants"

interface Top10CardProps {
  film: Film
  rank: number
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

export function Top10Card({ film, rank }: Top10CardProps) {
  const isMovie = film.media_type === "movie" || film.title !== undefined
  const title = isMovie ? film.title : film.name
  const slug = title ? slugify(title) : "untitled"
  const href = `/film/${isMovie ? "movie" : "tv"}/${film.id}/${slug}`
  const posterUrl = film.poster_path
    ? `${TMDB_IMAGE_BASE}/w500${film.poster_path}`
    : "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80"

  return (
    <Link href={href} className="group block relative">
      <div className="flex items-end gap-0">
        <div className="relative z-10 shrink-0 select-none pointer-events-none -mr-4 md:-mr-6">
          <svg
            viewBox="0 0 100 154"
            className="h-[180px] md:h-[220px] w-auto"
            style={{ filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.8))' }}
          >
            <text
              x="50"
              y="130"
              textAnchor="middle"
              className="fill-background"
              style={{
                fontFamily: 'var(--font-playfair-display), serif',
                fontSize: '140px',
                fontWeight: 900,
                stroke: '#4a4a4a',
                strokeWidth: '3px',
              }}
            >
              {rank}
            </text>
          </svg>
        </div>

        <div className="relative w-[100px] md:w-[130px] aspect-[2/3] rounded-md overflow-hidden bg-card z-20 group-hover:z-30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
          <img
            src={posterUrl}
            alt={title || "Film"}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="size-10 md:size-12 rounded-full bg-white/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
              <Play className="size-4 md:size-5 text-black fill-current ml-0.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
