"use client"

import type React from "react"

import { useState, useRef } from "react"
import useSWR from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, ArrowUp } from "lucide-react"

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
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
    <Card className="overflow-hidden relative flex flex-col h-full border-0 shadow-none bg-transparent">
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Timestamps</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs font-normal">
            {data.length.toLocaleString()} entries
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-[500px]" onScroll={handleScroll}>
          <div className="p-4 sm:p-6">
            <div className="space-y-2">
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
                    className="group flex gap-4 pl-4 py-2.5 transition-all hover:bg-muted/50 rounded-md cursor-pointer"
                  >
                    <div className="font-mono text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors shrink-0 min-w-[4rem]">
                      {timestamp}
                    </div>
                    <div className="flex-1 text-sm sm:text-base leading-relaxed text-foreground/90 group-hover:text-foreground transition-colors">
                      {text}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollArea>
        {showBackToTop && (
          <Button 
            onClick={scrollToTop} 
            size="icon" 
            className="absolute bottom-4 right-4 rounded-full shadow-lg z-10 h-9 w-9"
            variant="secondary"
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Back to top</span>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
