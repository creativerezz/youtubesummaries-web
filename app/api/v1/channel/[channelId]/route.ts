import { type NextRequest, NextResponse } from "next/server"
import {
  fetchSupadataChannel,
  fetchSupadataChannelVideos,
  fetchSupadataVideo,
} from "@/lib/supadata"

export const maxDuration = 30;

const SUPADATA_API_KEY = process.env.SUPADATA_API_KEY
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

function getAvatarUrl(name: string, bgColor: string = "6366f1"): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&size=240&bold=true`
}

function secondsToIsoDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "PT0S"
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  let d = "PT"
  if (h > 0) d += `${h}H`
  if (m > 0) d += `${m}M`
  d += `${s}S`
  return d
}

interface ChannelInfo {
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
}

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
}

// Demo channel data for fallback when API is unavailable or quota exceeded
const DEMO_CHANNELS: Record<string, { channelInfo: ChannelInfo; videos: VideoItem[] }> = {
  // My First Million
  "UCyaN6mg5u8Cjy2ZI4ikWaug": {
    channelInfo: {
      title: "My First Million",
      description: "Business ideas & strategies from Sam Parr and Shaan Puri",
      thumbnail: getAvatarUrl("MFM", "f59e0b"),
      subscriberCount: "1.5M",
    },
    videos: [
      { id: "dQw4w9WgXcQ", title: "Demo Video 1", thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg", publishedAt: "Dec 1, 2024", duration: "PT10M30S" },
      { id: "jNQXAC9IVRw", title: "Demo Video 2", thumbnail: "https://i.ytimg.com/vi/jNQXAC9IVRw/mqdefault.jpg", publishedAt: "Nov 28, 2024", duration: "PT8M15S" },
    ],
  },
  // Matt Wolfe
  "UCJ24N4O0bP7LGLBDvye7oCA": {
    channelInfo: {
      title: "Matt Wolfe",
      description: "AI news & tools - Stay up to date with artificial intelligence",
      thumbnail: getAvatarUrl("MW", "3b82f6"),
      subscriberCount: "800K",
    },
    videos: [
      { id: "dQw4w9WgXcQ", title: "AI News Demo", thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg", publishedAt: "Dec 2, 2024", duration: "PT15M0S" },
    ],
  },
  // Lex Fridman
  "UCSHZKyawb77ixDdsGog4iWA": {
    channelInfo: {
      title: "Lex Fridman",
      description: "Conversations about technology, science, and the human condition",
      thumbnail: getAvatarUrl("LF", "1f2937"),
      subscriberCount: "4.8M",
    },
    videos: [
      { id: "dQw4w9WgXcQ", title: "Podcast Demo", thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg", publishedAt: "Dec 1, 2024", duration: "PT2H30M0S" },
    ],
  },
  // All-In Podcast
  "UCbRP3c757lWg9M-U7TyEkXA": {
    channelInfo: {
      title: "All-In Podcast",
      description: "Tech & business analysis from industry experts",
      thumbnail: getAvatarUrl("All-In", "10b981"),
      subscriberCount: "2M",
    },
    videos: [
      { id: "dQw4w9WgXcQ", title: "All-In Demo", thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg", publishedAt: "Dec 3, 2024", duration: "PT1H45M0S" },
    ],
  },
  // Fireship
  "UCsBjURrPoezykLs9EqgamOA": {
    channelInfo: {
      title: "Fireship",
      description: "Code tutorials in 100 seconds - High-intensity code tutorials",
      thumbnail: getAvatarUrl("FS", "ef4444"),
      subscriberCount: "3M",
    },
    videos: [
      { id: "dQw4w9WgXcQ", title: "Code in 100 Seconds", thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg", publishedAt: "Dec 4, 2024", duration: "PT2M30S" },
    ],
  },
}

// Generic demo data for unknown channels
const DEFAULT_DEMO_CHANNEL = {
  channelInfo: {
    title: "Demo Channel",
    description: "This is demo data shown because YouTube API quota was exceeded",
    thumbnail: "",
    subscriberCount: "N/A",
  },
  videos: [
    { id: "dQw4w9WgXcQ", title: "Demo Video", thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg", publishedAt: "Dec 1, 2024", duration: "PT3M30S" },
  ],
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params

  if (!channelId) {
    return NextResponse.json({ error: "Channel ID is required" }, { status: 400 })
  }

  let cachedChannelInfo: ChannelInfo | null = null

  // 1. Try Supadata first (when API key is set)
  if (SUPADATA_API_KEY) {
    try {
      const [channel, videosData] = await Promise.all([
        fetchSupadataChannel(SUPADATA_API_KEY, channelId),
        fetchSupadataChannelVideos(SUPADATA_API_KEY, channelId, 20),
      ])

      if (channel) {
        const channelInfo: ChannelInfo = {
          title: channel.name,
          description: channel.description ?? "",
          thumbnail: channel.thumbnail ?? getAvatarUrl(channel.name),
          subscriberCount:
            channel.subscriberCount != null
              ? channel.subscriberCount.toLocaleString()
              : "N/A",
        }

        const videoIds = [
          ...(videosData?.videoIds ?? []),
          ...(videosData?.shortIds ?? []),
        ].slice(0, 20)

        if (videoIds.length > 0) {
          const videoDetails = await Promise.all(
            videoIds.map((id) => fetchSupadataVideo(SUPADATA_API_KEY!, id))
          )
          const videos: VideoItem[] = videoDetails
            .filter((v): v is NonNullable<typeof v> => v != null)
            .map((v) => ({
              id: v.id,
              title: v.title ?? "",
              thumbnail: v.thumbnail ?? `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`,
              publishedAt: v.uploadDate
                ? new Date(v.uploadDate).toLocaleDateString()
                : "",
              duration: v.duration != null ? secondsToIsoDuration(v.duration) : "PT0S",
            }))

          if (videos.length > 0) {
            return NextResponse.json({ channelInfo, videos })
          }
        }

        cachedChannelInfo = channelInfo
      }
    } catch {
      // Supadata failed; try YouTube API or demo
    }
  }

  // 2. Fallback to YouTube Data API if we have a key
  if (YOUTUBE_API_KEY) {
    try {

      // Fetch channel info
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`,
      )

      if (channelResponse.ok) {
        const channelData = await channelResponse.json()

        if (!channelData.items || channelData.items.length === 0) {
          return NextResponse.json({ error: "Channel not found" }, { status: 404 })
        }

        const channel = channelData.items[0]
        const channelInfo = {
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnail: channel.snippet.thumbnails.medium.url,
          subscriberCount: Number.parseInt(channel.statistics.subscriberCount).toLocaleString(),
        }

        // Fetch recent uploads
        const uploadsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=20&key=${YOUTUBE_API_KEY}`,
        )

        if (uploadsResponse.ok) {
          const uploadsData = await uploadsResponse.json()
          const videoIds = uploadsData.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(",")

          // Fetch video details for duration
          const detailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
          )
          const detailsData = await detailsResponse.json()

          const videos = uploadsData.items.map((item: { id: { videoId: string }; snippet: { title: string; thumbnails: { medium: { url: string } }; publishedAt: string } }, index: number) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
            duration: detailsData.items[index]?.contentDetails?.duration || "PT0S",
          }))

          return NextResponse.json({ channelInfo, videos })
        }
      }

      if (channelResponse.status === 403) {
        // Quota exceeded; fall through to demo data
      }
    } catch {
      // YouTube API failed; fall through to demo data
    }
  }

  // 3. Final fallback: demo data (or use cached channelInfo from Supadata)
  const demoData = DEMO_CHANNELS[channelId] || DEFAULT_DEMO_CHANNEL
  const finalChannelInfo = cachedChannelInfo || demoData.channelInfo

  return NextResponse.json({
    channelInfo: finalChannelInfo,
    videos: demoData.videos,
    isDemo: true,
    warning: cachedChannelInfo
      ? "Demo mode: Showing sample videos with live channel info. Video list will be restored shortly."
      : "Demo mode: Showing sample data. Live data will be restored shortly.",
  })
}
