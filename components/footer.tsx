import Link from "next/link"
import { Film, Github, Twitter } from "lucide-react"
import { SITE_NAME } from "@/lib/constants"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-card flex justify-center">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Film className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">{SITE_NAME}</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              An advanced and beautiful movie website with images, trailers and info about movies.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/movies" className="hover:text-primary">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/discover" className="hover:text-primary">
                  Discover
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-primary">
                  Favorites
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/genre/action" className="hover:text-primary">
                  Action
                </Link>
              </li>
              <li>
                <Link href="/genre/comedy" className="hover:text-primary">
                  Comedy
                </Link>
              </li>
              <li>
                <Link href="/genre/drama" className="hover:text-primary">
                  Drama
                </Link>
              </li>
              <li>
                <Link href="/genre/sci-fi" className="hover:text-primary">
                  Sci-Fi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com"
                  className="flex items-center gap-2 hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  className="flex items-center gap-2 hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-4 w-4" />
                  <span>Twitter</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} {SITE_NAME}. All rights reserved.
          </p>
          <p className="mt-1">
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
            {" • "}
            <Link href="/terms" className="hover:text-primary">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

