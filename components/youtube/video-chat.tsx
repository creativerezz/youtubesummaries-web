"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import useSWR from "swr"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VideoChatProps {
  videoId: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const captionsFetcher = async (url: string): Promise<string> => {
  const response = await fetch(url)
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || error.error || "Failed to fetch captions")
  }
  return response.text()
}

export function VideoChat({ videoId }: VideoChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { data: captions, error: captionsError } = useSWR(
    `/api/v1/transcript?video=${encodeURIComponent(videoId)}&languages=en&format=captions`,
    captionsFetcher,
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToTop = () => {
    scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]")?.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop
    setShowBackToTop(scrollTop > 300)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !captions || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: captions,
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (captionsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load captions for chat</AlertDescription>
      </Alert>
    )
  }

  if (!captions) {
    return (
      <div className="flex flex-col h-full min-h-0 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full mt-3" />
        <Skeleton className="h-3 w-4/5 mt-2" />
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden relative h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <ScrollArea ref={scrollAreaRef} className="h-full min-h-[200px]" onScroll={handleScroll}>
          <div className="p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <span className="text-[11px] text-muted-foreground">Ask about this video</span>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={message.role === "user" ? "text-right" : "text-left"}
                  >
                    <p className={`inline-block max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap px-3 py-2 ${
                      message.role === "user" ? "bg-foreground/10 rounded" : "bg-muted/40 rounded"
                    }`}>
                      {message.content}
                    </p>
                  </div>
                ))}
                {isLoading && (
                  <p className="text-[11px] text-muted-foreground py-2">…</p>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
        {showBackToTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="absolute bottom-16 right-4 text-[11px] text-muted-foreground hover:text-foreground z-10"
          >
            ↑ top
          </button>
        )}
      </div>
      <div className="shrink-0 p-3 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask…"
            disabled={isLoading}
            className="flex-1 h-8 text-xs border-0 border-b rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {isLoading ? "…" : "→"}
          </button>
        </form>
      </div>
    </div>
  )
}
