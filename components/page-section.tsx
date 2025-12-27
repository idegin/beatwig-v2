import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageSectionProps {
  heading: string
  subHeading?: string
  altLink?: {
    route: string
    text: string
  }
  children: React.ReactNode
  className?: string
}

export function PageSection({
  heading,
  subHeading,
  altLink,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn("py-8 md:py-12", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
              {heading}
            </h2>
            {subHeading && (
              <p className="text-sm text-muted-foreground md:text-base">
                {subHeading}
              </p>
            )}
          </div>
          {altLink && (
            <Link
              href={altLink.route}
              className="group flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {altLink.text}
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  )
}
