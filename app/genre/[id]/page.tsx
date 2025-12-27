"use client"

interface GenreDetailsPageProps {
  params: {
    id: string
  }
}

export default function GenreDetailsPage({ params }: GenreDetailsPageProps) {
  // Hardcoded sample data based on genre ID
  const genres = {
    "28": { name: "Action", description: "High-octane thrillers and adrenaline-pumping adventures that keep you on the edge of your seat." },
    "12": { name: "Adventure", description: "Epic journeys and explorations that take you to new worlds and unforgettable experiences." },
    "16": { name: "Animation", description: "Colorful worlds brought to life through stunning animation and imaginative storytelling." },
    "35": { name: "Comedy", description: "Laugh-out-loud moments and hilarious situations that brighten your day." },
    "80": { name: "Crime", description: "Gripping detective stories and criminal underworld tales that keep you guessing." },
    "99": { name: "Documentary", description: "Real stories from real people, exploring the world around us." },
    "18": { name: "Drama", description: "Emotional journeys and compelling character-driven stories." },
    "10751": { name: "Family", description: "Heartwarming stories perfect for the whole family to enjoy together." },
    "14": { name: "Fantasy", description: "Magical worlds and supernatural adventures beyond imagination." },
    "36": { name: "History", description: "Captivating tales from the past that bring history to life." },
    "27": { name: "Horror", description: "Chilling thrills and spine-tingling suspense that haunt your dreams." },
    "10402": { name: "Music", description: "Rhythm, melody, and the power of music in unforgettable stories." },
    "9648": { name: "Mystery", description: "Intriguing puzzles and enigmatic plots that challenge your mind." },
    "10749": { name: "Romance", description: "Love stories that touch your heart and warm your soul." },
    "878": { name: "Science Fiction", description: "Futuristic worlds and mind-bending concepts that expand your imagination." },
    "10770": { name: "TV Movie", description: "Special movies made for television with compelling narratives." },
    "53": { name: "Thriller", description: "Pulse-pounding suspense and tension that keeps you hooked." },
    "10752": { name: "War", description: "Powerful stories of conflict, courage, and human resilience." },
    "37": { name: "Western", description: "Classic tales of the Wild West and frontier adventures." },
  }

  const genreData = genres[params.id as keyof typeof genres] || { name: "Unknown Genre", description: "Genre details coming soon." }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[40vh] overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            {genreData.name}
          </h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
            {genreData.description}
          </p>
          <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-8 py-4 rounded-full text-2xl font-semibold shadow-lg">
            <span>Coming Soon</span>
          </div>
          <div className="mt-8 text-muted-foreground">
            <p>Explore amazing {genreData.name.toLowerCase()} films and shows in this genre.</p>
          </div>
        </div>
      </div>
    </div>
  )
}