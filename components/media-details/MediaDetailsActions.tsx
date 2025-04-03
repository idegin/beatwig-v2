'use client'
import {Button} from "@/components/ui/button";
import {Check, DownloadIcon, Loader2, Play, Plus} from "lucide-react";
import Link from "next/link";
import {TorrentsModal} from "@/components/TorrentsModal";
import {MovieTorrent} from "@/lib/yts";
import {useEffect, useState} from "react";
import {VideoPopup} from "@/components/video-popup";
import { addToWatchlist, getCurrentUser, isInWatchlist, removeFromWatchlist } from "@/lib/firebase";
import {useToast} from "@/components/ui/use-toast";

type Props = {
    type: "movie" | "tv"
    torrents?: MovieTorrent[];
    data: any;
}

export default function MediaDetailsActions({torrents, type, data}: Props) {
    const isMovieType = type === "movie"
    const title = isMovieType ? data.title : data.name;
    const videos = data.videos?.results || []
    const trailer = videos.find((video: any) => video.type === "Trailer" && video.site === "YouTube") || videos[0]
    const [showTorrents, setShowTorrents] = useState(false);
    const [showTrailer, setShowTrailer] = useState(false);
    const [isInUserWatchlist, setIsInUserWatchlist] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Check if the current user is logged in and if the item is in their watchlist
    useEffect(() => {
        const checkWatchlistStatus = async () => {
            const user = await getCurrentUser();
            setIsLoggedIn(!!user);
            
            if (user) {
                const inWatchlist = await isInWatchlist(data.id);
                setIsInUserWatchlist(inWatchlist);
            }
        };
        
        checkWatchlistStatus();
    }, [data.id]);

    const handleWatchlistToggle = async () => {
        if (!isLoggedIn) {
            toast({
                title: "Authentication required",
                description: "Please log in to add items to your watchlist",
                variant: "destructive",
            });
            return;
        }
        
        setIsLoading(true);
        try {
            if (isInUserWatchlist) {
                const result = await removeFromWatchlist(data.id);
                if (result.success) {
                    setIsInUserWatchlist(false);
                    toast({
                        title: "Removed from watchlist",
                        description: result.message,
                    });
                } else {
                    toast({
                        title: "Error",
                        description: result.message,
                        variant: "destructive",
                    });
                }
            } else {
                const result = await addToWatchlist(data, type);
                if (result.success) {
                    setIsInUserWatchlist(true);
                    toast({
                        title: "Added to watchlist",
                        description: result.message,
                    });
                } else {
                    toast({
                        title: "Error",
                        description: result.message,
                        variant: "destructive",
                    });
                }
            }
        } catch (error) {
            console.error("Error toggling watchlist:", error);
            toast({
                title: "Error",
                description: "Failed to update watchlist",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return <div>
        <TorrentsModal
            isOpen={showTorrents}
            onClose={() => setShowTorrents(false)}
            torrents={torrents || []}
            movieTitle={title}
            mediaType={type}
        />
        {trailer && (
            <VideoPopup
                videoId={trailer.key}
                title={`${title} - ${trailer.name}`}
                isOpen={showTrailer}
                onClose={() => setShowTrailer(false)}
            />
        )}
        <div className="mt-6 flex flex-col gap-3">
            {trailer && (
                <Button className="w-full gap-2" onClick={() => setShowTrailer(true)}>
                    <Play className="h-4 w-4"/>
                    Watch Trailer
                </Button>
            )}
            <Button 
                variant="outline" 
                className="w-full gap-2" 
                onClick={handleWatchlistToggle}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isInUserWatchlist ? (
                    <Check className="h-4 w-4" />
                ) : (
                    <Plus className="h-4 w-4" />
                )}
                {isInUserWatchlist ? "Remove From Watchlist" : "Add To Watchlist"}
            </Button>
            <Button
                variant="outline"
                className="w-full gap-2 relative"
                onClick={() => setShowTorrents(true)}
            >
                <span
                    className={'absolute right-3 -top-2 text-xs bg-primary text-primary-foreground px-2 rounded-lg shadow-md'}
                >
                    NEW
                </span>
                <DownloadIcon className="h-4 w-4"/>
                Download Movie
            </Button>
        </div>
    </div>
}
