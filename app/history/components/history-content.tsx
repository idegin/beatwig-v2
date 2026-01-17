"use client"

import * as React from "react"
import Link from "next/link"
import { Clock, Trash2, Film, Tv, Play, AlertTriangle, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { TMDB_IMAGE_BASE } from "@/app/constants"

interface HistoryItem {
  id: string
  filmId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  backdropPath: string | null
  progress: number
  progressSeconds: number
  season?: number
  episode?: number
  updatedAt: string
}

interface HistoryContentProps {
  initialHistory: HistoryItem[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date)
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${mins}m watched`
  }
  return `${mins}m watched`
}

export function HistoryContent({ initialHistory }: HistoryContentProps) {
  const [history, setHistory] = React.useState<HistoryItem[]>(initialHistory)
  const [deleteItem, setDeleteItem] = React.useState<HistoryItem | null>(null)
  const [bulkDeleteType, setBulkDeleteType] = React.useState<"all" | "older" | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDeleteClick = (item: HistoryItem) => {
    setDeleteItem(item)
  }

  const handleBulkDeleteClick = (type: "all" | "older") => {
    setBulkDeleteType(type)
  }

  const handleConfirmDelete = async () => {
    if (!deleteItem) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/auth/watch-history?id=${deleteItem.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete")
      }

      setHistory((prev) => prev.filter((item) => item.id !== deleteItem.id))
      toast.success("Removed from watch history", {
        description: `"${deleteItem.title}" has been removed from your watch history.`,
      })
    } catch (error) {
      console.error("Error deleting history item:", error)
      toast.error("Failed to delete", {
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setDeleteItem(null)
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteType) return

    setIsDeleting(true)
    try {
      let itemsToDelete: HistoryItem[] = []

      if (bulkDeleteType === "all") {
        itemsToDelete = history
      } else if (bulkDeleteType === "older") {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        itemsToDelete = history.filter((item) => new Date(item.updatedAt) < thirtyDaysAgo)
      }

      if (itemsToDelete.length === 0) {
        toast.info("Nothing to delete", {
          description: bulkDeleteType === "older" 
            ? "No items older than 30 days found."
            : "Your watch history is already empty.",
        })
        setBulkDeleteType(null)
        setIsDeleting(false)
        return
      }

      const deletePromises = itemsToDelete.map((item) =>
        fetch(`/api/auth/watch-history?id=${item.id}`, {
          method: "DELETE",
        })
      )

      const results = await Promise.allSettled(deletePromises)
      const successCount = results.filter((r) => r.status === "fulfilled").length
      const failCount = results.length - successCount

      if (successCount > 0) {
        const deletedIds = itemsToDelete.slice(0, successCount).map((item) => item.id)
        setHistory((prev) => prev.filter((item) => !deletedIds.includes(item.id)))
        
        toast.success(`Deleted ${successCount} item${successCount > 1 ? "s" : ""}`, {
          description: failCount > 0 
            ? `${failCount} item${failCount > 1 ? "s" : ""} failed to delete.`
            : bulkDeleteType === "all"
            ? "All watch history cleared."
            : "Older items removed successfully.",
        })
      }

      if (failCount > 0 && successCount === 0) {
        throw new Error("All deletions failed")
      }
    } catch (error) {
      console.error("Error bulk deleting history:", error)
      toast.error("Failed to delete", {
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setBulkDeleteType(null)
    }
  }

  const groupedHistory = React.useMemo(() => {
    const groups: { [key: string]: HistoryItem[] } = {}
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86400000)
    const lastWeek = new Date(today.getTime() - 7 * 86400000)
    const lastMonth = new Date(today.getTime() - 30 * 86400000)

    history.forEach((item) => {
      const date = new Date(item.updatedAt)
      let groupKey: string

      if (date >= today) {
        groupKey = "Today"
      } else if (date >= yesterday) {
        groupKey = "Yesterday"
      } else if (date >= lastWeek) {
        groupKey = "This Week"
      } else if (date >= lastMonth) {
        groupKey = "This Month"
      } else {
        groupKey = "Earlier"
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
    })

    return groups
  }, [history])

  const groupOrder = ["Today", "Yesterday", "This Week", "This Month", "Earlier"]

  return (
    <div className="min-h-screen">
      <div className="relative w-full overflow-hidden bg-linear-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="size-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Watch History</h1>
                <p className="text-muted-foreground mt-1">
                  {history.length} {history.length === 1 ? "item" : "items"} in your history
                </p>
              </div>
            </div>
            {history.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <MoreVertical className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => handleBulkDeleteClick("older")}
                    className="text-orange-600 dark:text-orange-400 focus:text-orange-600 dark:focus:text-orange-400"
                  >
                    <Trash2 className="size-4" />
                    Delete Older (30d+)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleBulkDeleteClick("all")}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Delete All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {history.length === 0 ? (
          <Card className="border-dashed py-16 text-center">
            <Clock className="size-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Watch History</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start watching movies and TV shows to build your watch history.
            </p>
            <Button asChild>
              <Link href="/movies">Browse Movies</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {groupOrder.map((groupName) => {
              const items = groupedHistory[groupName]
              if (!items || items.length === 0) return null

              return (
                <div key={groupName}>
                  <h2 className="text-lg font-semibold text-muted-foreground mb-4">
                    {groupName}
                  </h2>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <Card
                        key={item.id}
                        className="flex gap-4 p-4 hover:bg-accent/50 transition-colors group"
                      >
                        <Link
                          href={`/film/${item.mediaType}/${item.filmId}/${slugify(item.title)}`}
                          className="relative shrink-0 w-32 md:w-40"
                        >
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                            {item.backdropPath ? (
                              <img
                                src={`${TMDB_IMAGE_BASE}/w300${item.backdropPath}`}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : item.posterPath ? (
                              <img
                                src={`${TMDB_IMAGE_BASE}/w185${item.posterPath}`}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {item.mediaType === "movie" ? (
                                  <Film className="size-8 text-muted-foreground" />
                                ) : (
                                  <Tv className="size-8 text-muted-foreground" />
                                )}
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                              <Play className="size-8 text-white" />
                            </div>
                          </div>
                          {item.progress > 0 && (
                            <Progress
                              value={item.progress}
                              className="absolute bottom-0 left-0 right-0 h-1 rounded-none"
                            />
                          )}
                        </Link>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <Link
                            href={`/film/${item.mediaType}/${item.filmId}/${slugify(item.title)}`}
                            className="hover:text-primary transition-colors"
                          >
                            <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {item.mediaType === "movie" ? "Movie" : "TV Show"}
                            </Badge>
                            {item.season !== undefined && item.episode !== undefined && (
                              <span className="text-sm text-muted-foreground">
                                S{item.season} E{item.episode}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span>{formatDate(item.updatedAt)}</span>
                            {item.progressSeconds > 0 && (
                              <>
                                <span>•</span>
                                <span>{formatDuration(item.progressSeconds)}</span>
                              </>
                            )}
                            {item.progress > 0 && (
                              <>
                                <span>•</span>
                                <span>{item.progress}% complete</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-10 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(item)}
                          >
                            <Trash2 className="size-5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Remove from Watch History?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>"{deleteItem?.title}"</strong> from your watch history?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!bulkDeleteType} onOpenChange={(open) => !open && setBulkDeleteType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              {bulkDeleteType === "all" ? "Delete All Watch History?" : "Delete Older Watch History?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkDeleteType === "all" ? (
                <>
                  Are you sure you want to delete <strong>all {history.length} items</strong> from your watch history?
                  This will permanently remove all your viewing records.
                </>
              ) : (
                <>
                  This will delete all items older than <strong>30 days</strong> from your watch history.
                  Recent items will be preserved.
                </>
              )}
              <br /><br />
              <strong className="text-destructive">This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : bulkDeleteType === "all" ? "Delete All" : "Delete Older"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
