"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Menu,
  X,
  Film,
  Home,
  Heart,
  Clock,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Bell,
  Tv,
  Sun,
  Moon,
  LogIn,
  ChevronRight,
} from "lucide-react"
import { SITE_NAME } from "@/lib/constants"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { useAuth } from "@/context/auth.context"

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const { user, googleSignIn, logout } = useAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      const urlParams = new URLSearchParams(window.location.search)
      const query = urlParams.get("query")
      if (query && pathname.includes("/search")) {
        setSearchQuery(query)
      }
    }
  }, [pathname, isMounted])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn()
    } catch (error) {
      console.error("Failed to sign in with Google:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Failed to log out:", error)
    }
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Movies", href: "/movie", icon: Film },
    { name: "TV Shows", href: "/tv", icon: Tv },
    { name: "Watchlist", href: "/watchlist", icon: Clock },
    { name: "Favorites", href: "/favorites", icon: Heart },
  ]

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
      <header
          className={cn(
              "fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex justify-center",
              isScrolled ? "bg-background/80 backdrop-blur-md shadow-md" : "bg-gradient-to-b from-black/70 to-transparent",
          )}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src={'/logo.webp'} alt={'logo'} width={35} className={'rounded-lg'} />
            <span className="text-xl font-bold">{SITE_NAME}</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                  <Button
                      key={item.name}
                      asChild
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn("gap-2", isActive && "font-medium")}
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </Button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 z-50">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Input
                  type="search"
                  placeholder="Search movies & TV..."
                  className="w-[200px] lg:w-[300px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </form>

            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || "/placeholder-user.jpg"} alt={user.displayName || "User"} />
                      <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>{user.displayName || "My Account"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Watchlist</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      <span>History</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Theme</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Light</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="mr-2 h-4 w-4" />
                            <span>Dark</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("system")}>
                            <span className="mr-2">💻</span>
                            <span>System</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleGoogleSignIn}>
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[9999]">
              {/* Solid background layer */}
              <div className="absolute inset-0 bg-background" />
              
              {/* Mobile Menu Header */}
              <div className="relative flex items-center justify-between h-16 px-4 border-b bg-background">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <img src={'/logo.webp'} alt={'logo'} width={35} className={'rounded-lg'} />
                  <span className="text-xl font-bold">{SITE_NAME}</span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMenuOpen(false)}
                  className="h-10 w-10"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Mobile Menu Content */}
              <div className="relative overflow-y-auto h-[calc(100vh-4rem)] bg-background">
                <div className="px-4 py-6 space-y-6">
                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                        type="search"
                        placeholder="Search movies & TV shows..."
                        className="w-full h-12 pl-12 pr-4 text-base bg-muted/50 border-muted-foreground/20 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </form>

                  {/* User Section */}
                  {user ? (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                      <Avatar className="h-14 w-14 border-2 border-primary/50">
                        <AvatarImage src={user.photoURL || "/placeholder-user.jpg"} alt={user.displayName || "User"} />
                        <AvatarFallback className="text-lg">{user.displayName?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{user.displayName || "User"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="w-full h-12 rounded-xl gap-3 text-base"
                      onClick={handleGoogleSignIn}
                    >
                      <LogIn className="h-5 w-5" />
                      Sign in with Google
                    </Button>
                  )}

                  {/* Navigation Links */}
                  <nav className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider px-3 mb-3">
                      Browse
                    </p>
                    {navItems.map((item) => {
                      const isActive = pathname === item.href
                      const Icon = item.icon

                      return (
                          <Link
                              key={item.name}
                              href={item.href}
                              className={cn(
                                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                                  isActive 
                                    ? "bg-primary text-primary-foreground font-medium" 
                                    : "hover:bg-muted/50 active:bg-muted"
                              )}
                          >
                            <Icon className={cn(
                              "h-5 w-5",
                              isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            <span className="text-base">{item.name}</span>
                            <ChevronRight className={cn(
                              "h-4 w-4 ml-auto transition-transform",
                              isActive ? "text-primary-foreground/70" : "text-muted-foreground/50 group-hover:translate-x-1"
                            )} />
                          </Link>
                      )
                    })}
                  </nav>

                  {/* Divider */}
                  <div className="h-px bg-border" />

                  {/* Settings Section */}
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider px-3 mb-3">
                      Settings
                    </p>
                    
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        {theme === 'dark' ? (
                          <Moon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Sun className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-base">Theme</span>
                      </div>
                      <div className="flex gap-1 p-1 bg-muted rounded-lg">
                        <button
                          onClick={() => setTheme("light")}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-colors",
                            theme === "light" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Light
                        </button>
                        <button
                          onClick={() => setTheme("dark")}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-colors",
                            theme === "dark" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Dark
                        </button>
                      </div>
                    </div>

                    {user && (
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="text-base">Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
        )}
      </header>
  )
}
