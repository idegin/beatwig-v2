import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock, Download, FileType, HardDrive, Info } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface MovieTorrent {
    url: string
    quality: string
    size: string
    hash: string
}

interface TorrentsModalProps {
    isOpen: boolean
    onClose: () => void
    torrents: MovieTorrent[]
    movieTitle: string
    mediaType: "movie" | "tv"
}

export function TorrentsModal({ isOpen, onClose, torrents, movieTitle, mediaType }: TorrentsModalProps) {
    const isTVShow = mediaType === "tv";
    const hasNoTorrents = torrents.length === 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">Download "{movieTitle}"</DialogTitle>
                    <div className="flex items-center gap-2 bg-primary/5 p-3 rounded-lg mt-3 border border-primary/10">
                        <Info className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm text-foreground">
                            Learn how the downloads work{" "}
                            <Link href="" className="underline text-primary font-medium hover:text-primary/80 transition-colors">
                                Here
                            </Link>
                        </p>
                    </div>
                </DialogHeader>

                <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-1 select-none">
                    {isTVShow ? (
                        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                            <div className="flex flex-col items-center gap-3">
                                <Info className="h-10 w-10 text-primary/70" />
                                <h3 className="font-medium text-lg">TV Show Downloads Coming Soon</h3>
                                <p className="text-muted-foreground max-w-[300px]">
                                    We're currently working on bringing TV show downloads to the platform.
                                    Please check back later!
                                </p>
                            </div>
                        </div>
                    ) : hasNoTorrents ? (
                        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                            <div className="flex flex-col items-center gap-3">
                                <Clock className="h-10 w-10 text-primary/70" />
                                <h3 className="font-medium text-lg">Download Not Available Yet</h3>
                                <p className="text-muted-foreground max-w-[300px]">
                                    This movie might be too recent for downloads to be available.
                                    Please check back later as we regularly update our download options.
                                </p>
                            </div>
                        </div>
                    ) : (
                        torrents.map((torrent) => (
                            <div
                                key={torrent.hash}
                                className="border hover:bg-primary/5 select-none border-border/60 rounded-lg p-4 bg-card hover:border-primary/80 transition-all duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <FileType className="h-4 w-4 text-primary" />
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-medium">
                                                {torrent.quality}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <HardDrive className="h-4 w-4" />
                                            <span>{torrent.size}</span>
                                        </div>
                                    </div>

                                    <Button asChild variant="outline" size="sm" className="gap-2 h-9 px-4">
                                        <a href={torrent.url} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4" />
                                            Download
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}