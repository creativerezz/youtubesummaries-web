"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { trackEvent } from "@/lib/posthog"

interface FeaturedChannel {
  id: string
  name: string
  description: string
  thumbnail: string
}

const FEATURED_CHANNELS: FeaturedChannel[] = [
  {
    id: "UCyaN6mg5u8Cjy2ZI4ikWaug",
    name: "My First Million",
    description: "Business ideas & strategies",
    thumbnail: "/channels/my-first-million.jpg",
  },
  {
    id: "UCJ24N4O0bP7LGLBDvye7oCA",
    name: "Matt Wolfe",
    description: "AI news & tools",
    thumbnail: "/channels/matt-wolfe.jpg",
  },
  {
    id: "UCSHZKyawb77ixDdsGog4iWA",
    name: "Lex Fridman",
    description: "Tech & science interviews",
    thumbnail: "/channels/lex-fridman.jpg",
  },
  {
    id: "UCbRP3c757lWg9M-U7TyEkXA",
    name: "All-In Podcast",
    description: "Tech & business analysis",
    thumbnail: "/channels/all-in-podcast.jpg",
  },
  {
    id: "UCsBjURrPoezykLs9EqgamOA",
    name: "Fireship",
    description: "Code tutorials in 100 seconds",
    thumbnail: "/channels/fireship.jpg",
  },
]

function getAvatarUrl(name: string): string {
  const colors = ["3b82f6", "8b5cf6", "ec4899", "f97316", "10b981"]
  const colorIndex = name.charCodeAt(0) % colors.length
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colors[colorIndex]}&color=fff&size=128`
}

export function FeaturedChannels() {
  const [channelThumbnails, setChannelThumbnails] = useState<Record<string, string>>({})
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Fetch real channel thumbnails from the API
    const fetchThumbnails = async () => {
      const thumbnails: Record<string, string> = {}
      
      await Promise.all(
        FEATURED_CHANNELS.map(async (channel) => {
          try {
            const response = await fetch(`/api/channel/${channel.id}`)
            if (response.ok) {
              const data = await response.json()
              // Use thumbnail if available, even if it's demo data (better than nothing)
              if (data.channelInfo?.thumbnail) {
                thumbnails[channel.id] = data.channelInfo.thumbnail
              }
            }
          } catch (error) {
            // Silently fail and use placeholder
            console.warn(`Failed to fetch thumbnail for ${channel.name}:`, error)
          }
        })
      )
      
      setChannelThumbnails(thumbnails)
    }

    fetchThumbnails()
  }, [])

  const handleImageError = useCallback((channelId: string) => {
    setImageErrors((prev) => ({ ...prev, [channelId]: true }))
  }, [])

  const handleChannelClick = useCallback((channel: FeaturedChannel) => {
    trackEvent("channel_viewed", {
      channel_id: channel.id,
      channel_name: channel.name,
    })
  }, [])

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Popular Channels
        </h2>
        <p className="mt-2 text-muted-foreground">
          Browse recent uploads from top creators
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {FEATURED_CHANNELS.map((channel) => (
          <Link
            key={channel.id}
            href={`/channel/${channel.id}`}
            onClick={() => handleChannelClick(channel)}
          >
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
              <CardContent className="flex flex-col items-center p-4 sm:p-6">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 mb-3 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={
                      imageErrors[channel.id] || !channelThumbnails[channel.id]
                        ? getAvatarUrl(channel.name)
                        : channelThumbnails[channel.id]
                    }
                    alt={`${channel.name} channel avatar`}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(channel.id)}
                    sizes="(max-width: 640px) 64px, 80px"
                    loading="lazy"
                    unoptimized
                  />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-center leading-tight">
                  {channel.name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground text-center mt-1">
                  {channel.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
