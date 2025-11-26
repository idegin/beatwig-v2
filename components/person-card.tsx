import Image from "next/image"
import Link from "next/link"
import { getTMDBImageUrl } from "@/lib/utils"
import { PROFILE_SIZES } from "@/lib/constants"
import type { Person } from "@/lib/tmdb"
import { Star, User } from "lucide-react"

interface PersonCardProps {
  person: Person
  priority?: boolean
}

export function PersonCard({ person, priority = false }: PersonCardProps) {
  if (!person) return null

  // Use placeholder if no profile image is available
  const profileUrl = person.profile_path
    ? getTMDBImageUrl(person.profile_path, PROFILE_SIZES.MEDIUM)
    : null

  // Get the most popular known_for item
  const knownFor = person.known_for?.[0] as any
  const knownForTitle = knownFor ? (knownFor.title || knownFor.name) : null

  return (
    <Link href={`/person/${person.id}`} className="group movie-card">
      <div className="aspect-[2/3] w-full relative rounded-lg overflow-hidden bg-muted">
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={person.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <User className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Always visible name at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-sm font-semibold text-white line-clamp-1">{person.name}</h3>
          {person.known_for_department && (
            <p className="text-xs text-white/70 mt-0.5">{person.known_for_department}</p>
          )}
        </div>
        
        {/* Hover overlay with more details */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {person.popularity && (
            <div className="flex items-center gap-1 bg-primary/90 px-2 py-1 rounded-full">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium text-white">{person.popularity.toFixed(0)}</span>
            </div>
          )}
          {knownForTitle && (
            <p className="text-xs text-white/90 text-center mt-2 line-clamp-2">
              Known for: {knownForTitle}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

