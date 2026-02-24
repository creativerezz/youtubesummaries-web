"use client"

import type React from "react"

import { useState, useRef } from "react"
import useSWR from "swr"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface VideoTimestampsProps {
  videoId: string
  onTimestampClick?: (seconds: number) => void
  currentTime?: number
}

const fetcher = async (url: string): Promise<string[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Failed to fetch timestamps")
  }
  return response.json()
}

function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(":").map(Number)
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return 0
}

export function VideoTimestamps({ videoId, onTimestampClick, currentTime = 0 }: VideoTimestampsProps) {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { data, error, isLoading } = useSWR(
    `/api/v1/transcript?video=${encodeURIComponent(videoId)}&languages=en&format=timestamps`,
    fetcher,
  )

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop
    setShowBackToTop(scrollTop > 300)
  }

  const scrollToTop = () => {
    scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]")?.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="shrink-0 pb-3 flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex-1 min-h-0 space-y-3 p-4 sm:p-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-5 w-16 shrink-0" />
              <Skeleton className="h-5 flex-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <div className="overflow-hidden relative flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full min-h-[200px]" onScroll={handleScroll}>
          <div className="p-4">
            <div className="space-y-0">
              {data.map((entry, index) => {
                const match = entry.match(/^([0-9:]+)\s*-\s*(.+)$/)
                if (!match) return null

                const timestamp = match[1]
                const text = match[2]
                const seconds = timestampToSeconds(timestamp)

                return (
                  <div
                    key={index}
                    onClick={() => onTimestampClick?.(seconds)}
                    className="flex gap-3 py-2 border-b border-border/30 last:border-0 cursor-pointer hover:bg-muted/20"
                  >
                    <span className="font-mono text-[11px] text-muted-foreground shrink-0 w-12">{timestamp}</span>
                    <span className="flex-1 text-xs text-foreground/80 leading-relaxed">
                      {text}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollArea>
        {showBackToTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="absolute bottom-4 right-4 text-[11px] text-muted-foreground hover:text-foreground z-10"
          >
            ↑ top
          </button>
        )}
      </div>
    </div>
  )
}
