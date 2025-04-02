import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { PersonCard } from "@/components/person-card"
import type { Movie, TVShow, Person } from "@/lib/tmdb"
import { isPerson } from "@/lib/utils"

interface MediaSectionProps {
  title: string
  viewAllHref?: string
  items: (Movie | TVShow | Person)[]
}

export function MediaSection({ title, viewAllHref, items }: MediaSectionProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="py-8 media-section flex justify-center">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          {viewAllHref && (
            <Link href={viewAllHref} className="flex items-center text-sm font-medium text-primary hover:underline">
              View all
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item, index) => {
            if (isPerson(item)) {
              return <PersonCard key={item.id} person={item} priority={index < 6} />
            } else {
              return <MovieCard key={item.id} media={item} priority={index < 6} />
            }
          })}
        </div>
      </div>
    </section>
  )
}

