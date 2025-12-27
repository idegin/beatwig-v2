import { HomeHero } from "@/components/home/home-hero"
import Home from "@/components/home/home"
import { getHomePageData } from "@/lib/tmdb"
import { ContinueWatchingItem } from "@/types/firebase.types"

const continueWatchingData: ContinueWatchingItem[] = [
  {
    id: "1",
    title: "Stranger Things",
    type: "tv",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
    progress: 65,
    duration: "45m left",
    episode: 5,
    season: 4,
    year: 2022,
    rating: "TV-14",
  },
  {
    id: "2",
    title: "The Dark Knight",
    type: "movie",
    image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&q=80",
    progress: 30,
    duration: "1h 45m left",
    year: 2008,
    rating: "PG-13",
  },
  {
    id: "3",
    title: "Breaking Bad",
    type: "tv",
    image: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=500&q=80",
    progress: 80,
    duration: "12m left",
    episode: 8,
    season: 5,
    year: 2013,
    rating: "TV-MA",
  },
  {
    id: "4",
    title: "Inception",
    type: "movie",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&q=80",
    progress: 45,
    duration: "1h 20m left",
    year: 2010,
    rating: "PG-13",
  },
  {
    id: "5",
    title: "The Witcher",
    type: "tv",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
    progress: 20,
    duration: "48m left",
    episode: 3,
    season: 3,
    year: 2023,
    rating: "TV-MA",
  },
  {
    id: "6",
    title: "Dune",
    type: "movie",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80",
    progress: 55,
    duration: "1h 10m left",
    year: 2021,
    rating: "PG-13",
  },
  {
    id: "7",
    title: "House of the Dragon",
    type: "tv",
    image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=500&q=80",
    progress: 90,
    duration: "6m left",
    episode: 10,
    season: 1,
    year: 2022,
    rating: "TV-MA",
  },
  {
    id: "8",
    title: "Interstellar",
    type: "movie",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=500&q=80",
    progress: 10,
    duration: "2h 30m left",
    year: 2014,
    rating: "PG-13",
  },
]

export default async function Page() {
  const data = await getHomePageData()

  if (!data.heroData) {
    return <div className="min-h-screen flex items-center justify-center">Failed to load content</div>
  }

  return (
    <>
      <HomeHero data={data.heroData} />
      <Home
        continueWatch={continueWatchingData}
        becauseYouWatched={data.becauseYouWatched}
        nowShowingInTheaters={data.nowShowingInTheaters}
        upcomingMovies={data.upcomingMovies}
        romanceMovies={data.romanceMovies}
        actionMovies={data.actionMovies}
        popularOnApp={data.popularOnApp}
        genres={data.genres}
        networks={data.networks}
        popularPeople={data.popularPeople}
        heroData={data.heroData}
      />
    </>
  )
}
