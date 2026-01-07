"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { trackEvent } from "@/lib/posthog"

interface Video {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
  duration: string
}

interface ChannelInfo {
  title: string
  description: string
  thumbnail: string
  subscriberCount: string
}

export default function ChannelPage() {
  const params = useParams()
  const router = useRouter()
  const channelId = params.channelId as string

  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [warning, setWarning] = useState("")

  useEffect(() => {
    async function fetchChannelData() {
      try {
        setLoading(true)
        setError(null)
        setIsDemo(false)
        setWarning("")

        const response = await fetch(`/api/channel/${channelId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch channel data")
        }

        const data = await response.json()
        setChannelInfo(data.channelInfo)
        setVideos(
          data.videos.map((video: Video) => ({
            ...video,
            duration: formatDuration(video.duration),
          })),
        )
        setIsDemo(data.isDemo || false)
        setWarning(data.warning || "")

        trackEvent("channel_viewed", {
          channel_id: channelId,
          channel_name: data.channelInfo?.title,
          is_demo: data.isDemo,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (channelId) {
      fetchChannelData()
    }
  }, [channelId])

  const formatDuration = useCallback((duration: string) => {
    if (!duration) return "0:00"
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return duration

    const hours = Number.parseInt(match[1]) || 0
    const minutes = Number.parseInt(match[2]) || 0
    const seconds = Number.parseInt(match[3]) || 0

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }, [])

  const handleVideoClick = useCallback((video: Video) => {
    trackEvent("channel_video_clicked", {
      channel_id: channelId,
      video_id: video.id,
      video_title: video.title,
    })
    router.push(`/?video=${video.id}#demo`)
  }, [channelId, router])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <Skeleton className="mx-auto h-8 w-64 sm:mx-0" />
                  <Skeleton className="mx-auto h-4 w-32 sm:mx-0" />
                  <Skeleton className="mx-auto h-4 w-full max-w-2xl sm:mx-0" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-video w-full rounded-lg" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="mb-4 text-lg text-destructive">{error}</p>
              <Button onClick={() => router.push("/")}>Return Home</Button>
            </div>
          ) : (
            <div className="space-y-8">
              {isDemo && warning && (
                <Alert variant="default" className="border-blue-500/30 bg-blue-500/5">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-sm text-muted-foreground">{warning}</AlertDescription>
                </Alert>
              )}

              {channelInfo && (
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted">
                    <Image
                      src={channelInfo.thumbnail || "/placeholder.svg"}
                      alt={channelInfo.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                      priority
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="mb-1 text-2xl font-bold text-balance sm:text-3xl">{channelInfo.title}</h1>
                    <p className="mb-2 text-sm text-muted-foreground">{channelInfo.subscriberCount} subscribers</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{channelInfo.description}</p>
                  </div>
                </div>
              )}

              <div>
                <h2 className="mb-4 text-lg font-semibold">Recent Uploads</h2>
                {videos.length === 0 ? (
                  <p className="text-center text-muted-foreground">No videos found</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {videos.map((video) => (
                      <Card
                        key={video.id}
                        className="cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
                        onClick={() => handleVideoClick(video)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            handleVideoClick(video)
                          }
                        }}
                        aria-label={`Watch ${video.title}`}
                      >
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <Image
                            src={video.thumbnail || "/placeholder.svg"}
                            alt={video.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            loading="lazy"
                          />
                          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
                            {video.duration}
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="text-sm font-medium leading-tight line-clamp-2 text-balance">
                            {video.title}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">{video.publishedAt}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
