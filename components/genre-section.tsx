import Link from "next/link"
import type { Genre } from "@/lib/tmdb"
import { Button } from "@/components/ui/button"

interface GenreSectionProps {
  title: string
  genres: Genre[]
  type: "movie" | "tv"
}

export function GenreSection({ title, genres, type }: GenreSectionProps) {
  if (!genres || genres.length === 0) return null

  return (
    <section className="py-8 media-section">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>

        <div className="flex flex-wrap gap-3">
          {genres.map((genre) => (
            <Button key={genre.id} variant="outline" className="rounded-full" asChild>
              <Link href={`/${type}/genre/${genre.id}`}>{genre.name}</Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  )
}

