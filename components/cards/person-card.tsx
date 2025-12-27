"use client"

import Link from "next/link"
import { Person } from "@/types/tmdb.types"
import { User } from "lucide-react"
import { TMDB_IMAGE_BASE } from "@/app/constants"

interface PersonCardProps {
  person: Person
  size?: "default" | "compact"
}

export function PersonCard({ person, size = "default" }: PersonCardProps) {
  const imageUrl = person.profile_path
    ? `${TMDB_IMAGE_BASE}/w300${person.profile_path}`
    : null

  if (size === "compact") {
    return (
      <Link href={`/person/${person.id}`} className="group block text-center">
        <div className="relative mx-auto w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-muted border-2 border-transparent group-hover:border-primary transition-all">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={person.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <User className="size-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <h3 className="mt-2 text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {person.name}
        </h3>
        <p className="text-xs text-muted-foreground">{person.known_for_department}</p>
      </Link>
    )
  }

  return (
    <Link href={`/person/${person.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted border border-border/50 group-hover:border-primary/50 transition-all group-hover:shadow-xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={person.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <User className="size-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
          <p className="text-sm text-white/80 line-clamp-1">{person.known_for_department}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {person.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{person.known_for_department}</p>
      </div>
    </Link>
  )
}
