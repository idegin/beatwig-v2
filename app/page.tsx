import { HomeHero } from "@/components/home/home-hero"
import Home from "@/components/home/home"
import { getHomePageData } from "@/lib/tmdb"
import { getAuthToken } from "@/lib/auth-cookies"
import { verifyAuthToken, getUserAlgorithm } from "@/lib/server-auth"

export default async function Page() {
  const data = await getHomePageData()

  let showRecommendationBanner = false

  try {
    const token = await getAuthToken()
    if (token) {
      const user = await verifyAuthToken(token)
      if (user) {
        const algorithm = await getUserAlgorithm(user.uid)
        showRecommendationBanner = !algorithm || algorithm.items.length === 0
      }
    }
  } catch {
    showRecommendationBanner = false
  }

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
        showRecommendationBanner={showRecommendationBanner}
      />
    </>
  )
}
