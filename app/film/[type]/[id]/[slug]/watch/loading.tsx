import { Loader2 } from "lucide-react"

export default function WatchLoading() {
  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-12 animate-spin text-primary" />
        <p className="text-white/70 text-sm">Loading player...</p>
      </div>
    </div>
  )
}
