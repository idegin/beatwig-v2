import { HomeHero } from "@/components/home/home-hero"
import Home from "@/components/home/home"
import { getHomePageData } from "@/lib/tmdb"

export default async function Page() {
  const data = await getHomePageData()

  if (!data.heroData) {
    return <div className="min-h-screen flex items-center justify-center">Failed to load content</div>
  }

  return (
    <>
      <HomeHero data={data.heroData} />
      <Home
        continueWatch={[]}
        becauseYouWatched={data.becauseYouWatched}
        nowShowingInTheaters={data.nowShowingInTheaters}
        upcomingMovies={data.upcomingMovies}
        romanceMovies={data.romanceMovies}
        actionMovies={data.actionMovies}
        popularOnApp={data.popularOnApp}
        genres={data.genres}
        popularPeople={data.popularPeople}
        heroData={data.heroData}
      />
    </>
  )
}
