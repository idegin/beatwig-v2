"use client"

import { cn } from "@/lib/utils"

interface PageHeroProps {
  heading: string
  subHeading?: string
  backgroundImage?: string
  gradient?: "default" | "dark" | "light"
  children?: React.ReactNode
  className?: string
}

export function PageHero({
  heading,
  subHeading,
  backgroundImage,
  gradient = "default",
  children,
  className,
}: PageHeroProps) {
  const gradientClasses = {
    default: "from-black/80 via-black/60 to-background",
    dark: "from-black/90 via-black/70 to-background",
    light: "from-black/60 via-black/40 to-background",
  }

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      {backgroundImage && (
        <>
          <div className="absolute inset-0">
            <img
              src={backgroundImage}
              alt={heading}
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-b",
              gradientClasses[gradient]
            )}
          />
        </>
      )}

      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl">
            {heading}
          </h1>
          {subHeading && (
            <p className="text-lg md:text-xl text-white/90 drop-shadow-lg max-w-2xl">
              {subHeading}
            </p>
          )}
          {children}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  )
}
