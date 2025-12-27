"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
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

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/watchlist", label: "Watch List", icon: List },
  { href: "/countries", label: "Countries", icon: Globe },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/tv-shows", label: "TV Shows", icon: Tv },
]

export function Header() {
  const { theme, setTheme } = useTheme()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
              <span className="hidden text-xl font-bold sm:block font-(family-name:--font-playfair-display)">
                {appData.name}
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                >
                  <link.icon className="size-4 group-hover:text-primary transition-colors" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search movies, TV shows..."
                className="pl-10 pr-4 h-10 bg-muted/50 border-0 rounded-full focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all"
                >
                  <Avatar className="size-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      JD
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">
                      john@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Heart className="size-4" />
                  My Favorites
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <List className="size-4" />
                  Watch List
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-10 pr-4 h-11 bg-muted/50 border-0 rounded-full"
                    />
                  </div>
                  <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                      >
                        <link.icon className="size-5 text-primary" />
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <Avatar className="size-10">
                      <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground">
                        john@example.com
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                    >
                      <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {searchOpen && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search movies, TV shows..."
                className="pl-10 pr-4 h-10 bg-muted/50 border-0 rounded-full"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
