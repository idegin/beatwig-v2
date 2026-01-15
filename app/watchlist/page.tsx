import { PageHero } from "@/components/page-hero"
import { getAuthToken } from "@/lib/auth-cookies"
import { verifyAuthToken, getUserBookmarks, FilmBookmark } from "@/lib/server-auth"
import { WatchlistContent } from "./components/watchlist-content"

export const metadata = {
  title: "My Watchlist | BeatWig",
  description: "View and manage your saved movies and TV shows",
}

export default async function WatchlistPage() {
  let bookmarks: FilmBookmark[] = []
  
  const token = await getAuthToken()
  if (token) {
    const user = await verifyAuthToken(token)
    if (user) {
      bookmarks = await getUserBookmarks(user.uid)
    }
  }

  return (
    <div className="min-h-screen">
      <PageHero
        heading="My Watchlist"
        subHeading={`${bookmarks.length} ${bookmarks.length === 1 ? 'title' : 'titles'} saved to watch later`}
        backgroundImage="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80"
        gradient="dark"
      />
      <WatchlistContent initialBookmarks={bookmarks} />
    </div>
  )
}
