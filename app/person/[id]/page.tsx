"use client"

interface PersonDetailsPageProps {
  params: {
    id: string
  }
}

export default function PersonDetailsPage({ params }: PersonDetailsPageProps) {
  // Hardcoded sample data
  const people = {
    "1": {
      name: "Leonardo DiCaprio",
      biography: "Leonardo Wilhelm DiCaprio is an American actor, film producer, and environmental activist. He has often played unconventional roles, particularly in biopics and period films. As of 2019, he is the recipient of numerous accolades, including an Academy Award and three Golden Globe Awards.",
      profile_path: "https://image.tmdb.org/t/p/w500/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
      known_for_department: "Acting",
      birthday: "1974-11-11",
      place_of_birth: "Los Angeles, California, USA",
    },
    "2": {
      name: "Scarlett Johansson",
      biography: "Scarlett Johansson is an American actress and singer. She was the world's highest-paid actress in 2018 and 2019, and has featured multiple times on the Forbes Celebrity 100 list. Her films have grossed over $14.3 billion worldwide, making Johansson the ninth-highest-grossing box office star of all time.",
      profile_path: "https://image.tmdb.org/t/p/w500/6NsMbJXRlDZuDzatN2akFdGuTvx.jpg",
      known_for_department: "Acting",
      birthday: "1984-11-22",
      place_of_birth: "New York City, New York, USA",
    },
    "3": {
      name: "Denzel Washington",
      biography: "Denzel Hayes Washington Jr. is an American actor, director, and producer. He has received numerous accolades, including two Academy Awards, three Golden Globe Awards, a Tony Award, and the Cecil B. DeMille Award. In 2020, The New York Times named him the greatest actor of the 21st century.",
      profile_path: "https://image.tmdb.org/t/p/w500/9NyYBv3F8V2BfpjL6LJGz0Y7Np.jpg",
      known_for_department: "Acting",
      birthday: "1954-12-28",
      place_of_birth: "Mount Vernon, New York, USA",
    },
  }

  const personData = people[params.id as keyof typeof people] || {
    name: "Unknown Person",
    biography: "Person details coming soon.",
    profile_path: "https://image.tmdb.org/t/p/w500/placeholder.jpg",
    known_for_department: "Unknown",
    birthday: "Unknown",
    place_of_birth: "Unknown",
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[50vh] overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          <div className="lg:w-1/3 flex-shrink-0">
            <img
              src={personData.profile_path}
              alt={personData.name}
              className="w-full max-w-sm mx-auto lg:mx-0 rounded-lg shadow-2xl"
            />
          </div>

          <div className="lg:w-2/3">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {personData.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="text-lg font-medium text-muted-foreground">
                {personData.known_for_department}
              </span>
              {personData.birthday !== "Unknown" && (
                <>
                  <span className="text-lg text-muted-foreground">•</span>
                  <span className="text-lg text-muted-foreground">
                    Born {new Date(personData.birthday).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {personData.biography}
            </p>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-xl font-semibold">
                <span>Coming Soon</span>
              </div>
            </div>
            {personData.place_of_birth !== "Unknown" && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-semibold text-foreground min-w-[140px]">Place of Birth:</span>
                  <span className="text-muted-foreground">{personData.place_of_birth}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}