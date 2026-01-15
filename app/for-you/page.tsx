import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { HomeHero } from "@/components/home/home-hero"
import { ForYouContent } from "./components/for-you-content"
import { getForYouPageData } from "@/lib/tmdb"

export const metadata = {
  title: "For You | BeatWig",
  description: "Personalized recommendations based on your watch history",
}

export default async function ForYouPage() {
  const data = await getForYouPageData()

  if (!data.heroData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Failed to load content
      </div>
    )
  }

  return (
    <>
      <HomeHero data={data.heroData} />
      <ForYouContent
        genres={data.genres}
        continueWatch={[]}
        becauseYouWatched={data.becauseYouWatched}
      />
    </>
  )
}
