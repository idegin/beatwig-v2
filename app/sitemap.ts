import type { MetadataRoute } from "next"
import { getPopularMovies } from "@/lib/tmdb"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL for your site - using a default for server-side generation
  const baseUrl = "https://beatwig.site"

  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ] as MetadataRoute.Sitemap

  // Dynamic routes from popular movies
  try {
    const popularMovies = await getPopularMovies()

    const movieRoutes = popularMovies.results.map((movie) => ({
      url: `${baseUrl}/movie/${movie.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

    return [...routes, ...movieRoutes]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return routes
  }
}

