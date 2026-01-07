import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 30;

// fast-proxy-api backend URL (preferred over direct YouTube API)
const YOUTUBE_PROXY_URL = process.env.YOUTUBE_PROXY_URL || "https://api1.youtubesummaries.cc"

// Fallback: YouTube Data API v3 (only used if proxy fails)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

// Helper to generate UI Avatars URL (reliable placeholder that won't break)
function getAvatarUrl(name: string, bgColor: string = "6366f1"): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&size=240&bold=true`
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

  // Strategy: Try fast-proxy-api first, then direct YouTube API, then demo data

  // Store channelInfo from proxy response in case we need to use it with fallback videos
  let cachedChannelInfo: ChannelInfo | null = null

  // 1. Try fast-proxy-api backend
  try {
    console.log("[API] Trying fast-proxy-api for channel...")
    const proxyResponse = await fetch(
      `${YOUTUBE_PROXY_URL}/youtube/data/channel/${channelId}?max_results=20`,
      { next: { revalidate: 300 } }
    )

    if (proxyResponse.ok) {
      const data = await proxyResponse.json()
      console.log("[API] fast-proxy-api channel fetch successful")

      // Cache channelInfo for potential fallback use
      if (data.channelInfo) {
        cachedChannelInfo = data.channelInfo
      }

      // If videos array is empty, try fallback instead of returning empty results
      if (!data.videos || data.videos.length === 0) {
        console.warn("[API] fast-proxy-api returned empty videos array, trying fallback...")
        // Fall through to try direct YouTube API or demo data
      } else {
        return NextResponse.json({
          channelInfo: data.channelInfo,
          videos: data.videos,
        })
      }
    }

    // If proxy returns 403 (quota exceeded), fall through to demo data
    if (proxyResponse.status === 403) {
      console.warn("[API] fast-proxy-api quota exceeded, returning demo data for channel")
      const demoData = DEMO_CHANNELS[channelId] || DEFAULT_DEMO_CHANNEL
      return NextResponse.json({
        ...demoData,
        isDemo: true,
        warning: "Demo mode: Showing sample videos. Channel data will be restored shortly.",
      })
    }

    // If channel not found on proxy, fall through instead of returning 404
    // This allows the direct YouTube API to handle it (e.g. for new channels not yet indexed by proxy)
    if (proxyResponse.status === 404) {
      console.log("[API] fast-proxy-api channel not found, trying direct YouTube API fallback...")
    } else {
      console.warn(`[API] fast-proxy-api returned ${proxyResponse.status}, trying fallback...`)
    }
  } catch (proxyError) {
    console.warn("[API] fast-proxy-api unavailable:", proxyError)
  }

  // 2. Fallback to direct YouTube API if we have a key
  if (YOUTUBE_API_KEY) {
    try {
      console.log("[API] Falling back to direct YouTube API for channel...")

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

          console.log("[API] Direct YouTube API channel fetch successful")
          return NextResponse.json({ channelInfo, videos })
        }
      }

      if (channelResponse.status === 403) {
        console.warn("[API] Direct YouTube API quota exceeded")
      }
    } catch (apiError) {
      console.warn("[API] Direct YouTube API error:", apiError)
    }
  }

  // 3. Final fallback: demo data (or use cached channelInfo if available)
  console.log("[API] All sources failed, returning demo data for channel")
  const demoData = DEMO_CHANNELS[channelId] || DEFAULT_DEMO_CHANNEL

  // If we have cached channelInfo from proxy, use it instead of demo channelInfo
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
