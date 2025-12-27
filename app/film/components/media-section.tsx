"use client"

import * as React from "react"
import { Play, Image as ImageIcon, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
  published_at: string
}

interface ImageItem {
  file_path: string
  aspect_ratio: number
  width: number
  height: number
}

interface MediaSectionProps {
  videos: Video[]
  backdrops: ImageItem[]
  posters: ImageItem[]
}

function VideoCard({ video, onClick }: { video: Video; onClick: () => void }) {
  const thumbnailUrl = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer relative aspect-video rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
    >
      <img
        src={thumbnailUrl}
        alt={video.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
          <Play className="size-6 text-primary-foreground fill-current ml-1" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <span className="inline-block bg-primary/20 backdrop-blur-sm text-primary text-xs font-medium px-2 py-1 rounded mb-1">
          {video.type}
        </span>
        <h4 className="text-white text-sm font-medium line-clamp-2">{video.name}</h4>
      </div>
    </div>
  )
}

function ImageCard({ image, onClick }: { image: ImageItem; onClick: () => void }) {
  const imageUrl = `https://image.tmdb.org/t/p/w780${image.file_path}`
  const isBackdrop = image.aspect_ratio > 1

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer relative rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl ${
        isBackdrop ? "aspect-video" : "aspect-[2/3]"
      }`}
    >
      <img
        src={imageUrl}
        alt="Media"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="size-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
          <ImageIcon className="size-5 text-black" />
        </div>
      </div>
    </div>
  )
}

export function MediaSection({ videos, backdrops, posters }: MediaSectionProps) {
  const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null)
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)

  const trailers = videos.filter((v) => v.type === "Trailer" && v.site === "YouTube")
  const teasers = videos.filter((v) => v.type === "Teaser" && v.site === "YouTube")
  const clips = videos.filter((v) => v.type === "Clip" && v.site === "YouTube")
  const behindTheScenes = videos.filter((v) => v.type === "Behind the Scenes" && v.site === "YouTube")
  const allVideos = [...trailers, ...teasers, ...clips, ...behindTheScenes]

  if (allVideos.length === 0 && backdrops.length === 0 && posters.length === 0) {
    return null
  }

  return (
    <>
      <Tabs defaultValue="videos" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Media</h3>
          <TabsList className="bg-muted/50">
            {allVideos.length > 0 && (
              <TabsTrigger value="videos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Videos ({allVideos.length})
              </TabsTrigger>
            )}
            {backdrops.length > 0 && (
              <TabsTrigger value="backdrops" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Backdrops ({backdrops.length})
              </TabsTrigger>
            )}
            {posters.length > 0 && (
              <TabsTrigger value="posters" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Posters ({posters.length})
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {allVideos.length > 0 && (
          <TabsContent value="videos">
            <Carousel
              opts={{
                align: "start",
                loop: false,
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3 md:-ml-4">
                {allVideos.map((video) => (
                  <CarouselItem
                    key={video.id}
                    className="pl-3 md:pl-4 basis-[85%] sm:basis-[60%] md:basis-[45%] lg:basis-[35%] xl:basis-[28%]"
                  >
                    <VideoCard video={video} onClick={() => setSelectedVideo(video)} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
              <CarouselNext className="-right-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
            </Carousel>
          </TabsContent>
        )}

        {backdrops.length > 0 && (
          <TabsContent value="backdrops">
            <Carousel
              opts={{
                align: "start",
                loop: false,
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3 md:-ml-4">
                {backdrops.slice(0, 20).map((image, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-3 md:pl-4 basis-[85%] sm:basis-[60%] md:basis-[45%] lg:basis-[35%] xl:basis-[28%]"
                  >
                    <ImageCard
                      image={image}
                      onClick={() => setSelectedImage(`https://image.tmdb.org/t/p/original${image.file_path}`)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
              <CarouselNext className="-right-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
            </Carousel>
          </TabsContent>
        )}

        {posters.length > 0 && (
          <TabsContent value="posters">
            <Carousel
              opts={{
                align: "start",
                loop: false,
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3 md:-ml-4">
                {posters.slice(0, 20).map((image, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-3 md:pl-4 basis-[45%] sm:basis-[35%] md:basis-[25%] lg:basis-[18%] xl:basis-[14%]"
                  >
                    <ImageCard
                      image={image}
                      onClick={() => setSelectedImage(`https://image.tmdb.org/t/p/original${image.file_path}`)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
              <CarouselNext className="-right-4 size-10 bg-background/90 shadow-lg backdrop-blur-sm border-0 hover:bg-background hover:scale-110 transition-all disabled:opacity-0" />
            </Carousel>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-7xl w-[95vw] p-0 bg-black border-0 overflow-hidden" showCloseButton={false}>
          <DialogTitle className="sr-only">{selectedVideo?.name || "Video"}</DialogTitle>
          <div className="relative aspect-video">
            {selectedVideo && (
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 size-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="size-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl p-0 bg-transparent border-0" showCloseButton={false}>
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <div className="relative">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Media"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 size-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="size-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
