import Image from "next/image"
import Link from "next/link"
import { getTMDBImageUrl } from "@/lib/utils"
import { PROFILE_SIZES } from "@/lib/constants"
import type { Person } from "@/lib/tmdb"

interface PersonCardProps {
  person: Person
  priority?: boolean
}

export function PersonCard({ person, priority = false }: PersonCardProps) {
  if (!person) return null

  // Use placeholder if no profile image is available
  const profileUrl = person.profile_path
    ? getTMDBImageUrl(person.profile_path, PROFILE_SIZES.MEDIUM)
    : "/placeholder.svg?height=450&width=300"

  return (
    <Link href={`/person/${person.id}`} className="group movie-card">
      <div className="aspect-[2/3] w-full relative rounded-lg overflow-hidden">
        <Image
          src={profileUrl || "/placeholder.svg"}
          alt={person.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white line-clamp-1">{person.name}</h3>
            {person.known_for_department && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/80">{person.known_for_department}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

