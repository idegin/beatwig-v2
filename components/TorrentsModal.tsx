import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileType, HardDrive, Info } from "lucide-react"
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
}

export function TorrentsModal({ isOpen, onClose, torrents, movieTitle }: TorrentsModalProps) {
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

                <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-1">
                    {torrents.length > 0 ? (
                        torrents.map((torrent) => (
                            <div
                                key={torrent.hash}
                                className="border hover:bg-primary/20 border-border/60 rounded-lg p-4 bg-card hover:border-primary/80 transition-all duration-200"
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

                                    <Button asChild variant={'outline'} size="sm" className="gap-2 h-9 px-4">
                                        <a href={torrent.url} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4" />
                                            Download
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No download options available.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

