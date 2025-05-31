"use client"

import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface VideoPopupProps {
  videoId: string
  title: string
  isOpen: boolean
  onClose: () => void
  mediaId?: string
  mediaType?: string
}

export function VideoPopup({ videoId, title, isOpen, onClose, mediaId, mediaType }: VideoPopupProps) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actualVideoId, setActualVideoId] = useState(videoId)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchTrailer() {
      if (!videoId && mediaId && mediaType) {
        setLoading(true)
        try {
          const endpoint = mediaType === "movie" ? `/api/movies/${mediaId}/videos` : `/api/tv/${mediaId}/videos`

          const response = await fetch(endpoint)
          const data = await response.json()

          const trailer =
            data.results?.find((video: any) => video.type === "Trailer" && video.site === "YouTube") ||
            data.results?.[0]

          if (trailer) {
            setActualVideoId(trailer.key)
          }
        } catch (error) {
          console.error("Error fetching trailer:", error)
        } finally {
          setLoading(false)
        }
      } else if (videoId) {
        setActualVideoId(videoId)
      }
    }

    if (isOpen) {
      fetchTrailer()
    }
  }, [isOpen, videoId, mediaId, mediaType])

  if (!mounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[80vh] p-0 bg-black border-none">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden-">
          <Button
            // variant="ghost"
            size="icon"
            className="absolute -top-10 right-4 text-white hover:bg-white/20- z-[500]"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>

          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : actualVideoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${actualVideoId}?autoplay=1&modestbranding=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              No trailer available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

