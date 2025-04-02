"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { VideoPopup } from "@/components/video-popup"

interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
}

interface VideosGalleryProps {
  videos: Video[]
}

export function VideosGallery({ videos }: VideosGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  if (!videos || videos.length === 0) {
    return <p className="text-muted-foreground">No videos available.</p>
  }

  const youtubeVideos = videos.filter((video) => video.site === "YouTube")

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {youtubeVideos.slice(0, 4).map((video) => (
          <button
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            className="group relative aspect-video rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Image
              src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
              alt={video.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-12 w-12 text-white" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
              <h3 className="text-white font-medium line-clamp-1 text-left">{video.name}</h3>
              <p className="text-white/80 text-sm text-left">{video.type}</p>
            </div>
          </button>
        ))}
      </div>

      {youtubeVideos.length > 4 && (
        <button onClick={() => setSelectedVideo(youtubeVideos[4])} className="mt-4 text-primary hover:underline">
          View all {youtubeVideos.length} videos
        </button>
      )}

      {selectedVideo && (
        <VideoPopup
          videoId={selectedVideo.key}
          title={selectedVideo.name}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  )
}

