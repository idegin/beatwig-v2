"use client"

import * as React from "react"
import { Star, ThumbsUp, ChevronDown, ChevronUp, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Review {
  id: string
  author: string
  author_details: {
    name: string
    username: string
    avatar_path: string | null
    rating: number | null
  }
  content: string
  created_at: string
  updated_at: string
  url: string
}

interface FilmReviewsProps {
  reviews: Review[]
}

function ReviewCard({ review }: { review: Review }) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [showExpandButton, setShowExpandButton] = React.useState(false)

  React.useEffect(() => {
    if (contentRef.current) {
      setShowExpandButton(contentRef.current.scrollHeight > 120)
    }
  }, [review.content])

  const avatarUrl = review.author_details.avatar_path
    ? review.author_details.avatar_path.startsWith("/https")
      ? review.author_details.avatar_path.slice(1)
      : `https://image.tmdb.org/t/p/w100${review.author_details.avatar_path}`
    : null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-4 mb-4">
        <div className="shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={review.author}
              className="size-12 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
              <User className="size-6 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h4 className="font-semibold text-foreground">
                {review.author_details.name || review.author}
              </h4>
              <p className="text-sm text-muted-foreground">@{review.author_details.username}</p>
            </div>
            <div className="flex items-center gap-3">
              {review.author_details.rating && (
                <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-full">
                  <Star className="size-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold text-yellow-500">
                    {review.author_details.rating}/10
                  </span>
                </div>
              )}
              <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={contentRef}
        className={cn(
          "text-sm text-muted-foreground leading-relaxed overflow-hidden transition-all duration-300",
          !isExpanded && "max-h-[120px]"
        )}
      >
        <p className="whitespace-pre-line">{review.content}</p>
      </div>

      {showExpandButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 h-8 text-primary hover:text-primary"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="size-4 ml-1" />
            </>
          ) : (
            <>
              Read More <ChevronDown className="size-4 ml-1" />
            </>
          )}
        </Button>
      )}

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
        <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
          <ThumbsUp className="size-4 mr-2" />
          Helpful
        </Button>
      </div>
    </div>
  )
}

export function FilmReviews({ reviews }: FilmReviewsProps) {
  const [showAll, setShowAll] = React.useState(false)
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3)

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-card/30 rounded-xl border border-border/50">
        <p className="text-muted-foreground">No reviews yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-foreground">Reviews</h3>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
            {reviews.length}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {reviews.length > 3 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="rounded-full px-8"
          >
            {showAll ? "Show Less Reviews" : `Show All ${reviews.length} Reviews`}
          </Button>
        </div>
      )}
    </div>
  )
}
