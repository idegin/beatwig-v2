import { redirect } from "next/navigation"
import { getAuthToken } from "@/lib/auth-cookies"
import { verifyAuthToken, getUserAlgorithm, getUserWatchHistory } from "@/lib/server-auth"
import { ProfileContent } from "./components/profile-content"
import { TMDB_IMAGE_BASE } from "@/app/constants"

export const metadata = {
  title: "Profile | BeatWig",
  description: "Your BeatWig profile and preferences",
}

async function getProfileData(userId: string) {
  const [algorithm, watchHistory] = await Promise.all([
    getUserAlgorithm(userId),
    getUserWatchHistory(userId, 50, false),
  ])

  return {
    algorithm,
    watchHistory,
  }
}

export default async function ProfilePage() {
  const token = await getAuthToken()
  
  if (!token) {
    redirect("/")
  }

  const user = await verifyAuthToken(token)
  
  if (!user) {
    redirect("/")
  }

  const { algorithm, watchHistory } = await getProfileData(user.uid)

  const stats = {
    totalWatched: watchHistory.length,
    moviesWatched: watchHistory.filter((item) => item.mediaType === "movie").length,
    tvShowsWatched: watchHistory.filter((item) => item.mediaType === "tv").length,
    algorithmItems: algorithm?.items.length || 0,
  }

  const topAlgorithmItems = algorithm?.items
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 10)
    .map((item) => ({
      id: item.id,
      title: item.title,
      mediaType: item.mediaType,
      posterPath: item.image,
      backdropPath: item.backdropPath,
      rank: item.rank,
      voteAverage: item.voteAverage,
      genres: item.genres,
      releaseDate: item.releaseDate,
    })) || []

  const topGenres = algorithm?.genres
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 8)
    .map((g) => ({
      id: g.id,
      name: g.name,
      rank: g.rank,
    })) || []

  const topTags = algorithm?.tags
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 12)
    .map((t) => ({
      name: t.name,
      rank: t.rank,
    })) || []

  return (
    <ProfileContent
      user={{
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }}
      stats={stats}
      topAlgorithmItems={topAlgorithmItems}
      topGenres={topGenres}
      topTags={topTags}
      algorithmUpdatedAt={algorithm?.updatedAt || null}
    />
  )
}
