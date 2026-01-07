"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

interface VideoPlayerProps {
  videoId: string
  seekToTime?: number | null
  onSeekComplete?: () => void
  onTimeUpdate?: (time: number) => void
}

export function VideoPlayer({ videoId, seekToTime, onSeekComplete, onTimeUpdate }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (seekToTime !== null && seekToTime !== undefined && iframeRef.current) {
      const iframe = iframeRef.current
      iframe.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: "seekTo",
          args: [seekToTime, true],
        }),
        "*",
      )
      onSeekComplete?.()
    }
  }, [seekToTime, onSeekComplete])

  return (
    <Card className="overflow-hidden">
      <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: "56.25%" }}>
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        />
      </div>
    </Card>
  )
}
