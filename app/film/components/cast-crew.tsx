"use client"

import Link from "next/link"
import { User } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

interface CastCrewProps {
  cast: CastMember[]
  crew: CrewMember[]
}

function PersonCard({ 
  person, 
  subtitle 
}: { 
  person: { id: number; name: string; profile_path: string | null }
  subtitle: string 
}) {
  const imageUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
    : null

  return (
    <Link href={`/person/${person.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={person.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <User className="size-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h4 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {person.name}
          </h4>
          <p className="text-xs text-white/70 line-clamp-1 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </Link>
  )
}

export function CastCrew({ cast, crew }: CastCrewProps) {
  const keyCrewMembers = crew.filter(
    (member) =>
      member.job === "Director" ||
      member.job === "Producer" ||
      member.job === "Executive Producer" ||
      member.job === "Writer" ||
      member.job === "Screenplay" ||
      member.job === "Original Music Composer"
  )

  return (
    <div className="space-y-10">
      {cast.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-6">Top Cast</h3>
          <Carousel
            opts={{
              align: "start",
              loop: false,
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {cast.slice(0, 20).map((member) => (
                <CarouselItem
                  key={`${member.id}-${member.character}`}
                  className="pl-3 md:pl-4 basis-[35%] sm:basis-[28%] md:basis-[22%] lg:basis-[16%] xl:basis-[12%]"
                >
                  <PersonCard person={member} subtitle={member.character} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
            <CarouselNext className="-right-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
          </Carousel>
        </div>
      )}

      {keyCrewMembers.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-6">Key Crew</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {keyCrewMembers.slice(0, 12).map((member, index) => (
              <Link
                key={`${member.id}-${member.job}-${index}`}
                href={`/person/${member.id}`}
                className="group"
              >
                <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    {member.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w100${member.profile_path}`}
                        alt={member.name}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="size-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {member.name}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{member.job}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
