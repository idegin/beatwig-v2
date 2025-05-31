"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PersonDetails } from "@/lib/tmdb"
import { getTMDBImageUrl, formatDate, formatNumber } from "@/lib/utils"
import { PROFILE_SIZES } from "@/lib/constants"
import { Calendar, MapPin, ExternalLink, Heart, Star } from "lucide-react"

interface PersonHeroProps {
    person: PersonDetails
}

export function PersonHero({ person }: PersonHeroProps) {
    const profileImage = person.profile_path
        ? getTMDBImageUrl(person.profile_path, PROFILE_SIZES.LARGE)
        : "/placeholder.svg?height=632&width=421"

    const age = person.birthday && !person.deathday 
        ? new Date().getFullYear() - new Date(person.birthday).getFullYear()
        : null

    return (
        <div className="relative min-h-[80vh] flex items-center">
            {/* Background gradient with animated elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
            
            <div className="relative flex justify-center w-full">
                <div className="container py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
                        {/* Profile Image */}
                        <div className="lg:col-span-2 flex justify-center lg:justify-end">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-lg" />
                                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <img
                                    src={profileImage}
                                    alt={person.name}
                                    className="relative w-80 h-auto rounded-lg shadow-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="eager"
                                />
                            </div>
                        </div>

                        {/* Person Details */}
                        <div className="lg:col-span-3 space-y-6 text-center lg:text-left">
                            <div className="space-y-4">
                                <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-primary/20">
                                    {person.known_for_department}
                                </Badge>
                                
                                <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                                    {person.name}
                                </h1>

                                {person.also_known_as && person.also_known_as.length > 0 && (
                                    <p className="text-lg text-muted-foreground">
                                        Also known as: <span className="font-medium">{person.also_known_as.slice(0, 2).join(", ")}</span>
                                        {person.also_known_as.length > 2 && <span className="text-primary">{`, +${person.also_known_as.length - 2} more`}</span>}
                                    </p>
                                )}
                            </div>                            {/* Quick Stats */}
                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm">
                                {person.birthday && (
                                    <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/10">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span>
                                            {formatDate(person.birthday)}
                                            {age && <span className="text-primary ml-1">({age} years old)</span>}
                                        </span>
                                    </div>
                                )}
                                
                                {person.place_of_birth && (
                                    <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/10">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span>{person.place_of_birth}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/10">
                                    <Star className="h-4 w-4 text-primary" />
                                    <span>{formatNumber(Math.round(person.popularity))} <span className="text-muted-foreground">popularity</span></span>
                                </div>
                            </div>

                            {/* Biography Preview */}
                            {person.biography && (
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">Biography</h3>
                                    <p className="text-muted-foreground leading-relaxed max-w-2xl">
                                        {person.biography.length > 300 
                                            ? `${person.biography.slice(0, 300)}...` 
                                            : person.biography
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                {person.imdb_id && (
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={`https://www.imdb.com/name/${person.imdb_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="gap-2"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            IMDb Profile
                                        </a>
                                    </Button>
                                )}
                                
                                {person.homepage && (
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={person.homepage}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="gap-2"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Official Website
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
