"use client"

import type React from "react"
import { useState, useRef } from "react"
import useSWR from "swr"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Copy, Check, ArrowUp, Download, ExternalLink, MoreVertical, FileText } from "lucide-react"
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
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
    <Card className="overflow-hidden relative flex flex-col h-full border-0 shadow-none bg-transparent">
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Captions</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy} 
              className="gap-2 h-8 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleOpenInChatGPT}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in ChatGPT
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs font-normal">
            {wordCount.toLocaleString()} words
          </Badge>
          <Badge variant="secondary" className="text-xs font-normal">
            {charCount.toLocaleString()} chars
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-[500px]" onScroll={handleScroll}>
          <div className="p-4 sm:p-6">
            <div className="prose prose-sm sm:prose-base max-w-none leading-relaxed text-foreground dark:prose-invert prose-p:text-foreground/90 prose-p:mb-3">
              <p className="whitespace-pre-wrap font-sans">{captions}</p>
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
