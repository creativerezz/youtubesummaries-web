"use client"

import type React from "react"

import { useState, useRef } from "react"
import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VideoSummaryProps {
  videoId: string
}

const captionsFetcher = async (url: string): Promise<string> => {
  const response = await fetch(url)
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || error.error || "Failed to fetch captions")
  }
  return response.text()
}

export function VideoSummary({ videoId }: VideoSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { data: captions, error: captionsError } = useSWR(
    `/api/v1/transcript?video=${encodeURIComponent(videoId)}&languages=en&format=captions`,
    captionsFetcher,
  )

  const generateSummary = async () => {
    if (!captions) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: captions }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate summary")
    } finally {
      setIsGenerating(false)
    }
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

  if (captionsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load captions for summarization</AlertDescription>
      </Alert>
    )
  }

  if (!captions) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden relative">
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">AI Summary</h3>
          {!summary && (
            <Button onClick={generateSummary} disabled={isGenerating} size="sm" className="gap-2">
              {isGenerating ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Generate Summary
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      <ScrollArea ref={scrollAreaRef} className="h-[600px]" onScroll={handleScroll}>
        <div className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {summary ? (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none leading-relaxed text-foreground">
                <p className="whitespace-pre-wrap">{summary}</p>
              </div>
              <Button variant="outline" onClick={generateSummary} disabled={isGenerating} size="sm">
                Regenerate
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Click &quot;Generate Summary&quot; to create an AI-powered summary of this video</p>
            </div>
          )}
        </div>
      </ScrollArea>
      {showBackToTop && (
        <Button onClick={scrollToTop} size="icon" className="absolute bottom-4 right-4 rounded-full shadow-lg">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </Button>
      )}
    </Card>
  )
}
