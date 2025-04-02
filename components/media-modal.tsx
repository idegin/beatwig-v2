"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MediaModalProps {
  children: React.ReactNode
}

export function MediaModal({ children }: MediaModalProps) {
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Disable body scroll when modal is open
    document.body.style.overflow = "hidden"

    // Enable body scroll when modal is closed
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  // Handle click outside to close
  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      router.back()
    }
  }

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.back()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        ref={wrapperRef}
        className="relative w-full max-w-6xl max-h-[90vh] bg-background rounded-lg shadow-lg overflow-hidden"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-background/50 backdrop-blur-sm rounded-full"
          onClick={() => router.back()}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>

        <ScrollArea className="h-[90vh]">{children}</ScrollArea>
      </div>
    </div>
  )
}

