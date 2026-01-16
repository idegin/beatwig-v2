"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Home,
  List,
  Globe,
  Film,
  Tv,
  Search,
  Menu,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  Heart,
  LogIn,
  Loader2,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { appData } from "@/app/constants"
import { useAuth } from "@/context/auth-context"
import { AuthPopup } from "@/components/auth-popup"

const navLinks = [
  { href: "/", authHref: "/for-you", label: "Home", icon: Home },
  { href: "/watchlist", label: "Watch List", icon: List },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/tv-shows", label: "TV Shows", icon: Tv },
]

export function Header() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { authState, signOut, signInWithGoogle } = useAuth()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [authPopupOpen, setAuthPopupOpen] = React.useState(false)

  const user = authState.user
  const isLoading = authState.loading

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
    }
  }

  const userInitials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm"
          : "bg-linear-to-b from-black/80 to-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/icons/icon-192x192.png"
                alt="BeatWig"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="hidden text-2xl font-bold sm:block font-(family-name:--font-playfair-display)">
                {appData.name}
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const linkHref = user && link.authHref ? link.authHref : link.href
                return (
                  <Link
                    key={link.href}
                    href={linkHref}
                    className="group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                  >
                    <link.icon className="size-4 group-hover:text-primary transition-colors" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search movies, TV shows..."
                className="pl-10 pr-4 h-10 bg-muted/50 border-0 rounded-full focus-visible:ring-2 focus-visible:ring-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </form>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="size-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="size-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {isLoading ? (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                disabled
              >
                <Loader2 className="size-5 animate-spin" />
              </Button>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all"
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.displayName || "User"}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="size-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/watchlist">
                      <List className="size-4" />
                      Watch List
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/history">
                      <Clock className="size-4" />
                      Watch History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setAuthPopupOpen(true)}
                className="gap-2 rounded-full px-5"
              >
                <LogIn className="size-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden rounded-full"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-background/95 backdrop-blur-md p-0">
                <SheetHeader className="p-6 border-b border-border/50">
                  <SheetTitle className="flex items-center gap-3">
                    <Image
                      src="/icons/icon-192x192.png"
                      alt="BeatWig"
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                    <span className="text-xl font-bold text-primary font-(family-name:--font-playfair-display)">
                      BeatWig
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <form onSubmit={handleSearch} className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-10 pr-4 h-11 bg-muted/50 border-0 rounded-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </form>
                  <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => {
                      const linkHref = user && link.authHref ? link.authHref : link.href
                      return (
                        <Link
                          key={link.href}
                          href={linkHref}
                          className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                        >
                          <link.icon className="size-5 text-primary" />
                          <span>{link.label}</span>
                        </Link>
                      )
                    })}
                  </nav>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50">
                  {user ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                      <Avatar className="size-10">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.displayName || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full shrink-0"
                        onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                        }
                      >
                        <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setAuthPopupOpen(true)}
                      className="w-full gap-2 h-12 rounded-xl"
                    >
                      <LogIn className="size-4" />
                      Sign In with Google
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {searchOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search movies, TV shows..."
                className="pl-10 pr-4 h-10 bg-muted/50 border-0 rounded-full"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </form>
          </div>
        )}
      </div>

      <AuthPopup open={authPopupOpen} onOpenChange={setAuthPopupOpen} />
    </header>
  )
}
