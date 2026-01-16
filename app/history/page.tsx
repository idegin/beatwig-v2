import { redirect } from "next/navigation"
import { getAuthToken } from "@/lib/auth-cookies"
import { verifyAuthToken, getUserWatchHistory } from "@/lib/server-auth"
import { HistoryContent } from "./components/history-content"

export const metadata = {
  title: "Watch History | BeatWig",
  description: "Your watch history on BeatWig",
}

export default async function HistoryPage() {
  const token = await getAuthToken()
  
  if (!token) {
    redirect("/")
  }

  const user = await verifyAuthToken(token)
  
  if (!user) {
    redirect("/")
  }

  const watchHistory = await getUserWatchHistory(user.uid, 100, false)

  const formattedHistory = watchHistory.map((item) => ({
    id: item.id,
    filmId: item.filmId,
    mediaType: item.mediaType,
    title: item.title,
    posterPath: item.posterPath,
    backdropPath: item.backdropPath,
    progress: item.progress,
    progressSeconds: item.progressSeconds,
    season: item.season,
    episode: item.episode,
    updatedAt: item.updatedAt.toISOString(),
  }))

  return <HistoryContent initialHistory={formattedHistory} />
}
