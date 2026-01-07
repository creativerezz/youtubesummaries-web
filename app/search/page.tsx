"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoGrid } from "@/components/youtube/video-grid"
import { Search, AlertTriangle, UserPlus, Sparkles, Loader2, Clock, Lock } from "lucide-react"
import { trackEvent } from "@/lib/posthog"
import Link from "next/link"

// Safe auth check component
function useAuthCheck() {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/subscription')
        if (!response.ok) {
          setIsSignedIn(false)
          setIsLoaded(true)
          return
        }
        const data = await response.json()
        // Check if user is authenticated using the isAuthenticated flag
        setIsSignedIn(data.isAuthenticated || false)
        setIsLoaded(true)
      } catch {
        setIsSignedIn(false)
        setIsLoaded(true)
      }
    }
    checkAuth()
  }, [])

  return { isSignedIn, isLoaded }
}

interface Video {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
}

export default function SearchPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuthCheck()
  const [query, setQuery] = useState("")
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [warning, setWarning] = useState("")
  const [retryAfter, setRetryAfter] = useState<number | null>(null)
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    limit: number
    remaining: number
    reset: number
  } | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError("")
    setHasSearched(true)
    setIsDemo(false)
    setWarning("")

    trackEvent("search_performed", { query, is_signed_in: !!isSignedIn })

    try {
      const response = await fetch(`/api/v1/youtube/search?q=${encodeURIComponent(query)}`)
      
      // Extract rate limit headers
      const rateLimitLimit = response.headers.get("X-RateLimit-Limit")
      const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining")
      const rateLimitReset = response.headers.get("X-RateLimit-Reset")
      
      if (rateLimitLimit && rateLimitRemaining && rateLimitReset) {
        setRateLimitInfo({
          limit: parseInt(rateLimitLimit, 10),
          remaining: parseInt(rateLimitRemaining, 10),
          reset: parseInt(rateLimitReset, 10) * 1000, // Convert to milliseconds
        })
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfterHeader = response.headers.get("Retry-After")
          const retrySeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : null
          setRetryAfter(retrySeconds)
          
          // Extract rate limit info from response if available
          if (errorData.retryAfter) {
            setRetryAfter(errorData.retryAfter)
          }
          
          throw new Error(
            errorData.error ||
            `Rate limit exceeded. Please try again ${retrySeconds ? `in ${retrySeconds} seconds` : "later"}.`
          )
        }

        throw new Error(errorData.error || "Search failed")
      }
      const data = await response.json()
      setVideos(data.videos || [])
      setIsDemo(data.isDemo || false)
      setWarning(data.warning || "")
      setRetryAfter(null) // Clear retry after on success

      trackEvent("search_results", {
        query,
        result_count: data.videos?.length || 0,
        is_demo: data.isDemo,
        is_signed_in: !!isSignedIn,
      })
    } catch (err) {
      console.error("Search error:", err)
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setLoading(false)
    }
  }

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  const handleVideoSelect = (videoId: string) => {
    // Require login to analyze videos
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(`/?video=${videoId}`)}`)
      return
    }

    trackEvent("search_video_selected", { video_id: videoId, from_search: query || "popular" })
    // Navigate to home page with video param - this will auto-analyze
    router.push(`/?video=${videoId}`)
  }
  
  // Countdown timer for rate limit
  useEffect(() => {
    if (retryAfter && retryAfter > 0) {
      const interval = setInterval(() => {
        setRetryAfter((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            return null
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [retryAfter])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          {/* Search Header */}
          <div className="mb-8 sm:mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Search YouTube Videos
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto">
              Find any YouTube video and extract transcripts, summaries, and insights instantly
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8 p-4 sm:p-6 shadow-lg border-2">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for videos, channels, topics..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                  disabled={loading}
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                disabled={loading || !query.trim()}
                className="h-12 px-8 shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </form>
            {error && (
              <Alert 
                variant={error.includes("Rate limit") ? "default" : "destructive"} 
                className={`mt-4 ${
                  error.includes("Rate limit") 
                    ? "border-orange-500/50 bg-orange-500/10" 
                    : ""
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <p>{error}</p>
                  {error.includes("Rate limit") && (
                    <div className="space-y-2 pt-2 border-t border-orange-500/20">
                      {rateLimitInfo && (
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Lock className="h-3.5 w-3.5" />
                            <span>
                              {rateLimitInfo.remaining} of {rateLimitInfo.limit} searches remaining
                            </span>
                          </div>
                          {retryAfter && retryAfter > 0 && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Reset in {formatTimeRemaining(retryAfter)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {!isSignedIn && (
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-sm text-muted-foreground">
                            Sign in to get 30 searches per hour (vs 10 for anonymous users)
                          </p>
                          <Button asChild variant="outline" size="sm" className="shrink-0">
                            <Link href="/sign-in">Sign In</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </Card>

          {/* Sign in CTA for anonymous users */}
          {isLoaded && !isSignedIn && hasSearched && videos.length > 0 && (
            <Alert className="mb-6 border-blue-500/50 bg-blue-500/10">
              <UserPlus className="h-4 w-4 text-blue-500" />
              <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-blue-700 dark:text-blue-200">
                  Sign in to save your search results and analyze videos with AI
                </span>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Demo Mode Warning */}
          {isDemo && warning && (
            <Alert variant="default" className="mb-6 border-blue-500/30 bg-blue-500/5">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm text-muted-foreground">
                {warning}
              </AlertDescription>
            </Alert>
          )}

          {/* Results Header */}
          {hasSearched && videos.length > 0 && (
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Results for <span className="text-primary">&quot;{query}&quot;</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {videos.length} {videos.length === 1 ? 'video' : 'videos'} found
                </p>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden border shadow-sm">
                  <Skeleton className="aspect-video w-full" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : videos.length > 0 ? (
            <VideoGrid videos={videos} onVideoSelect={handleVideoSelect} />
          ) : hasSearched ? (
            <Card className="p-12 sm:p-16 text-center border shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-muted p-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No videos found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try a different search term or check your spelling
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setQuery("")}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 sm:p-16 text-center border shadow-sm">
              <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                <div className="rounded-full bg-primary/10 p-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Start searching</h3>
                  <p className="text-muted-foreground">
                    Enter a search term above to find YouTube videos and extract their transcripts, summaries, and insights
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
