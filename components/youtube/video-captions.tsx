"use client"

import type React from "react"
import { useState, useRef } from "react"
import useSWR from "swr"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface VideoCaptionsProps {
  videoId: string
  captions?: string
  onDownload?: () => void
  onOpenInChatGPT?: () => void
}

const fetcher = async (url: string): Promise<string> => {
  const response = await fetch(url)
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || error.error || "Failed to fetch captions")
  }
  return response.text()
}

export function VideoCaptions({ videoId, captions: providedCaptions, onDownload, onOpenInChatGPT }: VideoCaptionsProps) {
  const [copied, setCopied] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { data: fetchedCaptions, error, isLoading } = useSWR(
    providedCaptions ? null : `/api/v1/transcript?video=${encodeURIComponent(videoId)}&languages=en&format=captions`,
    fetcher,
  )

  const captions = providedCaptions || fetchedCaptions

  const handleCopy = async () => {
    if (captions) {
      await navigator.clipboard.writeText(captions)
      setCopied(true)
      toast.success('Captions copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (captions) {
      const blob = new Blob([captions], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `captions-${videoId}.txt`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Captions downloaded!')
    }
    onDownload?.()
  }

  const handleOpenInChatGPT = async () => {
    if (!captions) return
    try {
      await navigator.clipboard.writeText(captions)
      toast.success('Captions copied!', { description: 'Paste it into ChatGPT when it opens.' })
      await new Promise(r => setTimeout(r, 200))
      const win = window.open('https://chatgpt.com', '_blank', 'noopener,noreferrer')
      if (!win) toast.error('Popup blocked', { description: 'Please allow popups.' })
    } catch {
      toast.error('Failed to copy')
      window.open('https://chatgpt.com', '_blank', 'noopener,noreferrer')
    }
    onOpenInChatGPT?.()
  }

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

  if (isLoading && !providedCaptions) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        <div className="flex-1 min-h-0 space-y-3 p-4 sm:p-5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (error && !providedCaptions) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!captions) return null

  const wordCount = captions.split(/\s+/).filter(Boolean).length
  const charCount = captions.length

  return (
    <div className="overflow-hidden relative flex flex-col h-full min-h-0">
      <div className="shrink-0 px-4 pb-2 flex items-center justify-between gap-4">
        <span className="text-[11px] text-muted-foreground">{wordCount.toLocaleString()} words</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="text-[11px] text-muted-foreground hover:text-foreground p-0.5">
                ···
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-xs">
              <DropdownMenuItem onClick={handleOpenInChatGPT}>
                ChatGPT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full min-h-[200px]" onScroll={handleScroll}>
          <div className="p-4">
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">{captions}</p>
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
