"use client"

import Link from "next/link"

interface ThemeCardProps {
  theme: {
    name: string
    userCount?: number
  }
  size?: "default" | "large"
}

const themeColors: Record<string, string> = {
  superhero: "from-red-600 to-yellow-500",
  revenge: "from-gray-900 to-red-800",
  love: "from-pink-500 to-rose-400",
  friendship: "from-amber-500 to-orange-400",
  survival: "from-emerald-700 to-teal-600",
  adventure: "from-blue-600 to-cyan-500",
  mystery: "from-indigo-800 to-purple-700",
  horror: "from-gray-900 to-slate-800",
  comedy: "from-yellow-500 to-amber-400",
  drama: "from-violet-700 to-purple-600",
  action: "from-orange-600 to-red-500",
  thriller: "from-slate-800 to-gray-700",
  romance: "from-rose-500 to-pink-400",
  fantasy: "from-purple-600 to-fuchsia-500",
  "science fiction": "from-cyan-600 to-blue-500",
  crime: "from-zinc-800 to-slate-700",
  family: "from-green-500 to-emerald-400",
  war: "from-stone-700 to-zinc-600",
  history: "from-amber-700 to-yellow-600",
  music: "from-fuchsia-600 to-pink-500",
  documentary: "from-teal-600 to-cyan-500",
  animation: "from-violet-500 to-purple-400",
  western: "from-amber-600 to-orange-500",
  magic: "from-indigo-600 to-violet-500",
  space: "from-blue-900 to-indigo-800",
  time: "from-cyan-700 to-teal-600",
  monster: "from-green-800 to-emerald-700",
  zombie: "from-gray-800 to-green-900",
  vampire: "from-red-900 to-black",
  robot: "from-slate-600 to-zinc-500",
  alien: "from-green-600 to-teal-500",
  spy: "from-slate-700 to-gray-600",
  heist: "from-amber-600 to-yellow-500",
  prison: "from-stone-800 to-zinc-700",
  martial: "from-red-700 to-orange-600",
}

function getThemeColor(themeName: string): string {
  const lowerName = themeName.toLowerCase()
  
  for (const [key, color] of Object.entries(themeColors)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return color
    }
  }
  
  const hash = themeName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = [
    "from-red-600 to-orange-500",
    "from-blue-600 to-cyan-500",
    "from-green-600 to-emerald-500",
    "from-purple-600 to-violet-500",
    "from-pink-600 to-rose-500",
    "from-amber-600 to-yellow-500",
    "from-teal-600 to-cyan-500",
    "from-indigo-600 to-blue-500",
  ]
  return colors[hash % colors.length]
}

export function ThemeCard({ theme, size = "default" }: ThemeCardProps) {
  const gradientClass = getThemeColor(theme.name)

  return (
    <Link
      href={`/keyword/${encodeURIComponent(theme.name)}`}
      className="group block"
    >
      <div
        className={`relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-2xl ${
          size === "large" ? "aspect-video" : "aspect-16/10"
        }`}
      >
        <div className={`w-full h-full bg-linear-to-br ${gradientClass}`} />

        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black/30 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <h3
            className={`font-bold text-white text-center drop-shadow-lg transition-transform duration-300 group-hover:scale-110 capitalize ${
              size === "large" ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
            }`}
          >
            {theme.name}
          </h3>
          {theme.userCount && theme.userCount > 1 && (
            <span className="mt-1 text-xs text-white/70">
              {theme.userCount} users watching
            </span>
          )}
        </div>

        <div className="absolute inset-0 border-2 border-white/0 rounded-xl transition-all duration-300 group-hover:border-white/30" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </Link>
  )
}
