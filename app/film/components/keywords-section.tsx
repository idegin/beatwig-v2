"use client"

import Link from "next/link"
import { Tag } from "lucide-react"

interface Keyword {
  id: number
  name: string
}

interface KeywordsSectionProps {
  keywords: Keyword[]
}

export function KeywordsSection({ keywords }: KeywordsSectionProps) {
  if (keywords.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="size-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Keywords</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <Link
            key={keyword.id}
            href={`/keyword/${keyword.id}`}
            className="inline-flex items-center bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          >
            {keyword.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
