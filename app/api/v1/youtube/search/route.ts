import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getSupabaseClient } from "@/lib/supabase"
import {
  rateLimiters,
  checkRateLimit,
  getIdentifier,
  rateLimitResponse,
  rateLimitHeaders,
} from "@/lib/rate-limit"

export const maxDuration = 30;

// fast-proxy-api backend URL (preferred over direct YouTube API)
const YOUTUBE_PROXY_URL = process.env.YOUTUBE_PROXY_URL || "https://api1.youtubesummaries.cc"

// Fallback: YouTube Data API v3 (only used if proxy fails)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3"

// Demo videos for fallback when API is unavailable or quota exceeded
const DEMO_VIDEOS = [
  {
    id: "dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up (Official Video)",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    channelTitle: "Rick Astley",
    publishedAt: "2009-10-25T06:57:33Z",
  },
  {
    id: "jNQXAC9IVRw",
    title: "Me at the zoo",
    thumbnail: "https://i.ytimg.com/vi/jNQXAC9IVRw/mqdefault.jpg",
    channelTitle: "jawed",
    publishedAt: "2005-04-24T03:31:52Z",
  },
  {
    id: "9bZkp7q19f0",
    title: "PSY - GANGNAM STYLE M/V",
    thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg",
    channelTitle: "officialpsy",
    publishedAt: "2012-07-15T07:46:38Z",
  },
  {
    id: "kJQP7kiw5Fk",
    title: "Luis Fonsi - Despacito ft. Daddy Yankee",
    thumbnail: "https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg",
    channelTitle: "Luis Fonsi",
    publishedAt: "2017-01-13T00:19:38Z",
  },
  {
    id: "OPf0YbXqDm0",
    title: "Mark Ronson - Uptown Funk (Official Video) ft. Bruno Mars",
    thumbnail: "https://i.ytimg.com/vi/OPf0YbXqDm0/mqdefault.jpg",
    channelTitle: "Mark Ronson",
    publishedAt: "2014-11-19T15:00:01Z",
  },
  {
    id: "fJ9rUzIMcZQ",
    title: "Queen - Bohemian Rhapsody (Official Video Remastered)",
    thumbnail: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg",
    channelTitle: "Queen Official",
    publishedAt: "2008-08-01T19:40:02Z",
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  // Check authentication and subscription tier
  let userId: string | null = null
  let isPro = false

  try {
    const authResult = await auth()
    userId = authResult.userId

    // If user is authenticated, check subscription tier
    if (userId) {
      try {
        const supabase = getSupabaseClient()
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_tier, subscription_status")
          .eq("clerk_user_id", userId)
          .single()

        isPro =
          profile?.subscription_tier === "pro" &&
          profile?.subscription_status === "active"
      } catch (error) {
        console.warn("Error fetching subscription:", error)
      }
    }
  } catch (error) {
    console.warn("Error checking auth:", error)
  }

  // Apply tiered rate limiting
  const identifier = getIdentifier(request, userId)
  let rateLimitResult

  if (isPro) {
    // Pro users: 100 requests per hour
    rateLimitResult = await checkRateLimit(
      rateLimiters.youtubeSearchPro,
      identifier
    )
  } else if (userId) {
    // Authenticated free users: 30 requests per hour
    rateLimitResult = await checkRateLimit(
      rateLimiters.youtubeSearchAuthenticated,
      identifier
    )
  } else {
    // Anonymous users: 10 requests per hour (per IP)
    rateLimitResult = await checkRateLimit(
      rateLimiters.youtubeSearchAnonymous,
      identifier
    )
  }

  if (!rateLimitResult.success) {
    return rateLimitResponse(
      rateLimitResult,
      userId
        ? "Rate limit exceeded. Please try again later or upgrade to Pro for higher limits."
        : "Rate limit exceeded. Sign in for higher limits or try again later."
    )
  }

  // Strategy: Try fast-proxy-api first, then direct YouTube API, then demo data

  // 1. Try fast-proxy-api backend
  try {
    console.log("[API] Trying fast-proxy-api for search...")
    const proxyResponse = await fetch(
      `${YOUTUBE_PROXY_URL}/youtube/data/search?q=${encodeURIComponent(query)}&max_results=12`,
      { next: { revalidate: 60 } }
    )

    if (proxyResponse.ok) {
      const data = await proxyResponse.json()
      console.log("[API] fast-proxy-api search successful")
      return NextResponse.json(
        { videos: data.videos || [] },
        { headers: rateLimitHeaders(rateLimitResult) }
      )
    }

    // If proxy returns 403 (quota exceeded), fall through to demo data
    if (proxyResponse.status === 403) {
      console.warn("[API] fast-proxy-api quota exceeded, returning demo data")
      return NextResponse.json(
        {
          videos: DEMO_VIDEOS,
          isDemo: true,
          warning: "Demo mode: Showing sample videos. Search functionality will be restored shortly.",
        },
        { headers: rateLimitHeaders(rateLimitResult) }
      )
    }

    console.warn(`[API] fast-proxy-api returned ${proxyResponse.status}, trying fallback...`)
  } catch (proxyError) {
    console.warn("[API] fast-proxy-api unavailable:", proxyError)
  }

  // 2. Fallback to direct YouTube API if we have a key
  if (YOUTUBE_API_KEY) {
    try {
      console.log("[API] Falling back to direct YouTube API...")
      const response = await fetch(
        `${YOUTUBE_API_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=12&key=${YOUTUBE_API_KEY}`,
      )

      if (response.ok) {
        const data = await response.json()
        const videos =
          data.items?.map((item: { id: { videoId: string }; snippet: { title: string; thumbnails: { medium: { url: string } }; channelTitle: string; publishedAt: string } }) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
          })) || []
        console.log("[API] Direct YouTube API search successful")
        return NextResponse.json(
          { videos },
          { headers: rateLimitHeaders(rateLimitResult) }
        )
      }

      if (response.status === 403) {
        console.warn("[API] Direct YouTube API quota exceeded")
      }
    } catch (apiError) {
      console.warn("[API] Direct YouTube API error:", apiError)
    }
  }

  // 3. Final fallback: demo data
  console.log("[API] All sources failed, returning demo data")
  return NextResponse.json(
    {
      videos: DEMO_VIDEOS,
      isDemo: true,
      warning: "Demo mode: Showing sample videos. Search functionality will be restored shortly.",
    },
    { headers: rateLimitHeaders(rateLimitResult) }
  )
}
