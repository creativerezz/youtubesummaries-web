"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, X, Copy, Loader2, FileText, Sparkles, Download, ExternalLink, Save, MoreVertical, Share2, Twitter, Facebook } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"
import { trackEvent } from "@/lib/posthog"
import { toast } from "sonner"
import { fetchTranscript, fetchTimestamps, fetchCaptions } from "@/lib/youtube-transcript-api"

// Helper function to convert transcript text to TranscriptSegment array
function textToTranscriptSegments(text: string): TranscriptSegment[] {
  const words = text.split(' ')
  return words.map((word, index) => ({
    text: word,
    start: index * 2, // Approximate timing (2 seconds per word)
    duration: 2
  }))
}

const exampleVideos = [
  {
    id: 1,
    title: "TON 618: The Black Hole That Breaks the Universe",
    thumbnail: "https://img.youtube.com/vi/i3GIzBzNAAU/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=i3GIzBzNAAU",
    transcript: "", // Add transcript text here when available
  },
  {
    id: 2,
    title: "Life's most important moments are flukes, not fate",
    thumbnail: "https://img.youtube.com/vi/IaBn3McvJI8/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=IaBn3McvJI8",
    transcript: "", // Add transcript text here when available
  },
  {
    id: 3,
    title: "Micro-interactions to delight your users",
    thumbnail: "https://img.youtube.com/vi/jgrkV_hJdJw/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=jgrkV_hJdJw",
    transcript: "", // Add transcript text here when available
  },
  {
    id: 4,
    title: "Good News For Startups: Enterprise Is Bad At AI",
    thumbnail: "https://img.youtube.com/vi/DULfEcPR0Gc/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=DULfEcPR0Gc",
    transcript: "", // Add transcript text here when available
  },
  {
    id: 5,
    title: "Every Type Of API You Must Know Explained!",
    thumbnail: "https://img.youtube.com/vi/pBASqUbZgkY/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=pBASqUbZgkY",
    transcript: "", // Add transcript text here when available
  },
  {
    id: 6,
    title: "RIP Deepseek. We have a new #1 open-source AI model",
    thumbnail: "https://img.youtube.com/vi/xt6_zIKeX6A/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=xt6_zIKeX6A",
    transcript: "", // Add transcript text here when available
  },
  {
    id: 7,
    title: "How I use Claude Code for real engineering",
    thumbnail: "https://img.youtube.com/vi/kZ-zzHVUrO4/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=kZ-zzHVUrO4",
    transcript: "", // Add transcript text here when available
  },
  {
    id: 8,
    title: "The Age of Laser Warfare Has Begun",
    thumbnail: "https://img.youtube.com/vi/8VLovd9bS5U/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=8VLovd9bS5U",
    transcript: "", // Add transcript text here when available
  },
  {
    id: 9,
    title: "The Louvre: The Wildest Robbery of the 21st Century",
    thumbnail: "https://img.youtube.com/vi/4NsAMEKcawA/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=4NsAMEKcawA",
    transcript: "", // Add transcript text here when available
  },
  {
    id: 10,
    title: "AI-Piloted Fighter Drone About To Transform Warfare",
    thumbnail: "https://img.youtube.com/vi/ZA_QzeN8fCs/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=ZA_QzeN8fCs",
    transcript: "", // Add transcript text here when available
  },
  {
    id: 11,
    title: "DeepSeek OCR - More than OCR",
    thumbnail: "https://img.youtube.com/vi/YEZHU4LSUfU/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=YEZHU4LSUfU",
    transcript: "", // Add transcript text here when available
  },
  {
    id: 12,
    title: "Willpower won't save you from bad habits",
    thumbnail: "https://img.youtube.com/vi/vSxomJb2KGE/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=vSxomJb2KGE",
    transcript: "", // Add transcript text here when available
  },
]

interface TranscriptSegment {
  text: string
  start: number
  duration: number
}

interface TranscriptData {
  video_id: string
  language: string
  language_code: string
  is_generated: boolean
  transcript: TranscriptSegment[]
}

// Extract video ID function (moved outside component for use in useEffect)
function extractVideoId(url: string): string | null {
  // If it's already a video ID (11 characters), return as is
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim()
  }
  
  // Extract from various YouTube URL formats
  // Handles: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
  // Also handles query parameters like ?si=... by stopping at ? or &
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

// Cache configuration
const CACHE_KEY_PREFIX = 'yt_demo_'
const CACHE_EXPIRY_HOURS = 24

interface CachedVideoData {
  transcript: TranscriptData
  summary: string
  timestamp: number
}

function getCachedVideoData(videoId: string): CachedVideoData | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${videoId}`
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    const parsed: CachedVideoData = JSON.parse(cached)
    const now = Date.now()
    const expiryTime = CACHE_EXPIRY_HOURS * 60 * 60 * 1000

    if (now - parsed.timestamp > expiryTime) {
      localStorage.removeItem(cacheKey)
      return null
    }

    return parsed
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

function setCachedVideoData(videoId: string, transcript: TranscriptData, summary: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${videoId}`
    const data: CachedVideoData = {
      transcript,
      summary,
      timestamp: Date.now(),
    }
    localStorage.setItem(cacheKey, JSON.stringify(data))
  } catch (error) {
    console.error('Error writing cache:', error)
  }
}

export default function VideoAnalyzer() {
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/watch?v=i3GIzBzNAAU")
  const [selectedExample, setSelectedExample] = useState<number | null>(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [preloadingVideos, setPreloadingVideos] = useState<Set<string>>(new Set())
  const [thinkingText, setThinkingText] = useState<string>('')
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const transcriptSectionRef = useRef<HTMLDivElement>(null)
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasStartedPreloading = useRef(false)

  // API base URL - can be configured via environment variable
  const API_BASE_URL = (typeof window !== 'undefined' && (window as unknown as { __API_BASE_URL__?: string }).__API_BASE_URL__) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
    'https://api1.youtubesummaries.cc'

  const cleanMarkdownSummary = (text: string): string => {
    if (!text) return text

    return text
      // Remove all timestamp references in various formats: [00:48], [77:92], [336:64], etc.
      // This catches timestamps at start of line, end of line, middle of line, and in bullet points
      .replace(/\[\d+:\d+\]/g, '')
      // Remove any remaining timestamp patterns that might have different formats
      .replace(/\[\d{1,3}:\d{1,2}\]/g, '')
      // Remove leading/trailing whitespace from each line
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      // Clean up "Takeaway:" and "Final takeaway:" - ensure they're properly formatted
      .replace(/\*\*Takeaway:\*\*\s*/g, '\n\n**Takeaway:**\n\n')
      .replace(/\*\*Final takeaway:\*\*\s*/g, '\n\n**Final takeaway:**\n\n')
      // Clean up horizontal rules - ensure consistent formatting
      .replace(/-{3,}/g, '---')
      .replace(/\n-{3}\n/g, '\n\n---\n\n')
      // Ensure proper spacing after headings (but not if next line is blank)
      .replace(/(#{1,6}\s+.+)\n([^\n\s])/g, '$1\n\n$2')
      // Clean up multiple consecutive blank lines (more than 2)
      .replace(/\n{3,}/g, '\n\n')
      // Clean up spacing around code blocks if any
      .replace(/```\n\n/g, '```\n')
      .replace(/\n\n```/g, '\n```')
      // Remove empty lines at start/end
      .trim()
  }

  /**
   * Render AI-generated markdown text with proper formatting
   * Uses react-markdown for full markdown support
   */
  const renderMarkdown = (text: string) => {
    if (!text) return null
    
    return (
      <div className="prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ ...props }) => <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-6 mb-4" {...props} />,
            h2: ({ ...props }) => <h2 className="text-lg sm:text-xl font-bold text-foreground mt-5 mb-3" {...props} />,
            h3: ({ ...props }) => <h3 className="text-sm sm:text-base font-bold mt-4 mb-2 text-[#00A5F4] leading-tight" {...props} />,
            h4: ({ ...props }) => <h4 className="text-xs sm:text-sm font-bold mt-3 mb-1.5 text-[#00A5F4]" {...props} />,
            h5: ({ ...props }) => <h5 className="text-xs sm:text-sm font-semibold mt-2 mb-1 text-[#00A5F4]/85" {...props} />,
            h6: ({ ...props }) => <h6 className="text-xs sm:text-sm font-semibold mt-2 mb-1 text-[#00A5F4]/70" {...props} />,
            p: ({ ...props }) => <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mb-2 sm:mb-3" {...props} />,
            ul: ({ ...props }) => <ul className="list-disc ml-4 sm:ml-6 my-2 space-y-1" {...props} />,
            ol: ({ ...props }) => <ol className="list-decimal ml-4 sm:ml-6 my-2 space-y-1" {...props} />,
            li: ({ ...props }) => <li className="text-xs sm:text-sm text-foreground/90" {...props} />,
            code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) => {
              const match = /language-(\w+)/.exec(className || "")
              const isInline = !match
              return isInline ? (
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs sm:text-sm font-mono text-foreground" {...props}>
                  {children}
                </code>
              ) : (
                <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-3 my-3">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              )
            },
            a: ({ children, ...props }: React.ComponentPropsWithoutRef<'a'>) => (
              <a
                className="text-primary underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            ),
            strong: ({ ...props }) => <strong className="font-semibold text-foreground" {...props} />,
            blockquote: ({ ...props }) => (
              <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/80 my-3" {...props} />
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    )
  }

  // Detect touch device on mount
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current)
      }
    }
  }, [])

  // Preload demo videos on mount
  useEffect(() => {
    if (hasStartedPreloading.current) return
    hasStartedPreloading.current = true

    const API_BASE_URL_FOR_PRELOAD = (typeof window !== 'undefined' && (window as unknown as { __API_BASE_URL__?: string }).__API_BASE_URL__) ||
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
      'https://api1.youtubesummaries.cc'

    const preloadDemoVideos = async () => {
      for (const video of exampleVideos) {
        const videoId = extractVideoId(video.url)
        if (!videoId) continue

        // Skip if video has stored transcript (no need to preload)
        if (video.transcript && video.transcript.trim().length > 0) {
          continue
        }

        // Check cache first
        const cached = getCachedVideoData(videoId)
        if (cached) {
          // Already cached, skip
          continue
        }

        // Check if already preloading
        if (preloadingVideos.has(videoId)) continue

        // Start preloading in background
        setPreloadingVideos(prev => new Set(prev).add(videoId))
        
        try {
          // Fetch transcript and summary in parallel
          const [captionsResponse, timestampsResponse] = await Promise.all([
            fetch(`/api/v1/transcript?video=${videoId}&languages=en&format=captions`),
            fetch(`/api/v1/transcript?video=${videoId}&languages=en&format=timestamps`)
          ])

          if (!captionsResponse.ok || !timestampsResponse.ok) {
            continue // Skip if failed
          }

          // Parse responses - new API returns plain text for captions
          const captionsText = await captionsResponse.text()
          const timestampsData = await timestampsResponse.json()

          // Build transcript array from plain text captions
          let transcriptArray: TranscriptSegment[] = []
          if (captionsText && captionsText.trim().length > 0) {
            const words = captionsText.split(' ')
            transcriptArray = words.map((word: string, index: number) => ({
              text: word,
              start: index * 2,
              duration: 2
            }))
          }

          if (transcriptArray.length === 0) continue

          // Build transcript data
          const transcriptText = transcriptArray.map(seg => seg.text).join(' ')
          // New API returns array for timestamps, not metadata object
          const language = Array.isArray(timestampsData) ? 'English' : (timestampsData?.language || 'English')
          const languageCode = Array.isArray(timestampsData) ? 'en' : (timestampsData?.language_code || 'en')
          const isGenerated = Array.isArray(timestampsData) ? true : (timestampsData?.is_generated || false)
          
          const transcriptData: TranscriptData = {
            video_id: videoId,
            language,
            language_code: languageCode,
            is_generated: isGenerated,
            transcript: transcriptArray
          }

          // Fetch summary (non-streaming for preload)
          try {
            const summaryResponse = await fetch('/api/summarize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transcript: transcriptText,
                videoId: videoId,
                userId: 'anonymous',
              }),
            })

            if (summaryResponse.ok && summaryResponse.body) {
              // Read streaming response
              const reader = summaryResponse.body.getReader()
              const decoder = new TextDecoder()
              let accumulatedText = ''
              let buffer = ''

              while (true) {
                const { done, value } = await reader.read()
                if (done) {
                  const finalChunk = decoder.decode()
                  if (finalChunk) buffer += finalChunk
                  break
                }

                const chunk = decoder.decode(value, { stream: true })
                buffer += chunk
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6)
                    if (data === '[DONE]') break
                    try {
                      const parsed = JSON.parse(data)
                      if (parsed.content) {
                        accumulatedText += parsed.content
                      }
                    } catch {
                      // Skip invalid JSON
                    }
                  }
                }
              }

              reader.releaseLock()

              // Clean and cache
              const cleanedSummary = cleanMarkdownSummary(accumulatedText)
              setCachedVideoData(videoId, transcriptData, cleanedSummary)
            }
          } catch (summaryError) {
            // Silently fail for preload
            console.debug('Preload summary failed for', videoId, summaryError)
          }
        } catch (error) {
          // Silently fail for preload
          console.debug('Preload failed for', videoId, error)
        } finally {
          setPreloadingVideos(prev => {
            const next = new Set(prev)
            next.delete(videoId)
            return next
          })
        }
      }
    }

    // Preload after a short delay to not block initial render
    const timeoutId = setTimeout(preloadDemoVideos, 1000)
    return () => clearTimeout(timeoutId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount - preloadingVideos intentionally excluded to prevent re-runs

  const handleAnalyze = async () => {
    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      setError("Invalid YouTube URL")
      return
    }

    // Check cache first
    const cached = getCachedVideoData(videoId)
    if (cached) {
      setTranscript(cached.transcript)
      setSummary(cached.summary)
      setIsAnalyzing(false)
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setTranscript(null)
    setSummary(null)

    // Scroll to results area when analysis starts
    setTimeout(() => {
      transcriptSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    try {
      let transcriptData: TranscriptData | null = null

      // Try to use transcript storage API first (with caching)
      try {
        // Fetch transcript data from FastAPI
        const transcriptResult = await fetchTranscript(videoUrl, ['en'])

        // Parse the transcript data
        const captionsText = transcriptResult.captions

        // Try to fetch timestamps for better timing
        let timestampsData: Array<{text: string, start: number, duration: number}> = []
        try {
          timestampsData = await fetchTimestamps(videoUrl, ['en'])
        } catch (e) {
          console.warn('Failed to fetch timestamps:', e)
        }

        // Convert to TranscriptSegment array
        let transcriptArray: TranscriptSegment[] = []

        if (captionsText && captionsText.trim().length > 0) {
          // If we have timestamps, use them directly (they're already properly structured)
          if (timestampsData.length > 0) {
            transcriptArray = timestampsData.map(entry => ({
              text: entry.text,
              start: entry.start,
              duration: entry.duration
            }))
          } else {
            // Fallback to simple word-based timing
            transcriptArray = textToTranscriptSegments(captionsText)
          }
        }

        if (transcriptArray.length === 0) {
          throw new Error('No transcript data found in cached response')
        }

        // Create transcript data structure
        transcriptData = {
          video_id: videoId,
          language: 'English', // Default, could be extracted from metadata if available
          language_code: 'en',
          is_generated: true, // Assume auto-generated
          transcript: transcriptArray
        }
      } catch (transcriptApiError) {
        // Fallback to original API if transcript storage API fails
        console.warn('Transcript storage API failed, falling back to direct API:', transcriptApiError)
        
        // Fetch captions and timestamps in parallel (like YouTubeSummaries app)
        const [captionsResponse, timestampsResponse] = await Promise.all([
          fetch(`/api/v1/transcript?video=${videoId}&languages=en&format=captions`),
          fetch(`/api/v1/transcript?video=${videoId}&languages=en&format=timestamps`)
        ])

        // Check if captions request failed
        if (!captionsResponse.ok) {
          let errorMessage = `HTTP ${captionsResponse.status}: ${captionsResponse.statusText}`
          try {
            const contentType = captionsResponse.headers.get('content-type')
            if (contentType && contentType.includes('application/json')) {
              const errorData = await captionsResponse.json()
              errorMessage = errorData.detail || errorMessage
            }
          } catch (parseError) {
            console.error('Error parsing API error response:', parseError)
          }

          // Simplify YouTube blocking errors
          if (errorMessage.includes('YouTube is blocking requests') || errorMessage.includes('Could not retrieve a transcript')) {
            errorMessage = 'This video\'s captions are currently unavailable. This may be due to:\n' +
              '• The video doesn\'t have captions/subtitles enabled\n' +
              '• Temporary YouTube API restrictions\n' +
              '• The video is private or restricted\n\n' +
              'Try another video or check back later.'
          }

          throw new Error(errorMessage)
        }

        // Check if timestamps request failed
        if (!timestampsResponse.ok) {
          let errorMessage = `Failed to fetch timestamps: HTTP ${timestampsResponse.status}`
          try {
            const errorData = await timestampsResponse.json()
            errorMessage = errorData.detail || errorData.detail || errorMessage
          } catch (parseError) {
            console.error('Error parsing timestamps error response:', parseError)
          }
          throw new Error(errorMessage)
        }

        // Parse captions response - new API returns plain text
        const captionsText = await captionsResponse.text()
        let transcriptArray: TranscriptSegment[] = []

        // Build transcript array from plain text captions
        if (captionsText && captionsText.trim().length > 0) {
          transcriptArray = textToTranscriptSegments(captionsText)
        }

        if (transcriptArray.length === 0) {
          throw new Error('No transcript data found in response')
        }

        // Parse timestamps response - new API returns array of strings, not metadata object
        const timestampsData = await timestampsResponse.json()
        let language = 'English'
        let languageCode = 'en'
        let isGenerated = false

        // New API returns array of timestamp strings, not metadata object
        // Default to English, auto-generated if we get timestamps array
        if (Array.isArray(timestampsData) && timestampsData.length > 0) {
          language = 'English'
          languageCode = 'en'
          isGenerated = true // Assume auto-generated if we only get timestamps array
        } else if (timestampsData && typeof timestampsData === 'object' && !Array.isArray(timestampsData)) {
          // Fallback: handle old API format if metadata object is returned
          if ('language' in timestampsData) language = timestampsData.language
          if ('language_code' in timestampsData) languageCode = timestampsData.language_code
          if ('is_generated' in timestampsData) isGenerated = timestampsData.is_generated
        }

        // Create transcript data structure
        transcriptData = {
          video_id: videoId,
          language,
          language_code: languageCode,
          is_generated: isGenerated,
          transcript: transcriptArray
        }
      }

      if (!transcriptData) {
        throw new Error('Failed to fetch transcript data')
      }

      setTranscript(transcriptData)
      setIsAnalyzing(false) // Stop loading immediately after transcript is ready
      
      // Scroll to transcript section
      setTimeout(() => {
        transcriptSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      
      // Start summary generation in background (non-blocking)
      const transcriptText = transcriptData.transcript.map((seg: TranscriptSegment) => seg.text).join(' ')
      fetchSummary(videoId, transcriptText, transcriptData) // Don't await - let it run in background
      
      // Track successful video analysis
      trackEvent('video_analyzed', {
        video_id: videoId,
        video_url: videoUrl,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching the transcript")
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setVideoUrl("")
    setTranscript(null)
    setError(null)
    setSummary(null)
  }

  const fetchSummary = async (videoId: string, transcriptText: string, transcriptData?: TranscriptData) => {
    setIsLoadingSummary(true)
    setIsStreaming(false)
    setSummary(null)
    
    // Simple typing text indicator (like Claude Code)
    const thinkingMessages = [
      'Thinking...',
      'Analyzing transcript...',
      'Extracting key insights...',
      'Summarizing content...',
      'Processing information...'
    ]
    
    let messageIndex = 0
    let thinkingInterval: NodeJS.Timeout | null = null
    
    thinkingInterval = setInterval(() => {
      setThinkingText(thinkingMessages[messageIndex % thinkingMessages.length])
      messageIndex++
    }, 2000) // Change message every 2 seconds

    try {
      // Use local API route for streaming summarization
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcriptText,
          videoId: videoId,
          userId: 'anonymous', // You can get this from auth if available
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch summary")
      }

      if (!response.body) {
        throw new Error('Response body is null - streaming not supported')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let accumulatedText = ''
      let buffer = '' // Buffer for incomplete lines across chunks
      setIsStreaming(true)
      if (thinkingInterval) {
        clearInterval(thinkingInterval) // Stop thinking messages when streaming starts
        thinkingInterval = null
      }

      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            // Decode any remaining bytes in the decoder
            const finalChunk = decoder.decode()
            if (finalChunk) {
              buffer += finalChunk
            }
            
            // Process any remaining buffer
            if (buffer.trim()) {
              const lines = buffer.split('\n')
              for (const line of lines) {
                const trimmedLine = line.trim()
                if (trimmedLine && trimmedLine.startsWith('data: ')) {
                  const data = trimmedLine.slice(6)
                  if (data !== '[DONE]') {
                    try {
                      const parsed = JSON.parse(data)
                      if (parsed.content) {
                        accumulatedText += parsed.content
                        // Update UI immediately during streaming
                        setSummary(accumulatedText.replace(/\n\n\n+/g, '\n\n'))
                      } else if (parsed.error) {
                        throw new Error(parsed.error)
                      }
                    } catch (e) {
                      console.debug('Final buffer parse error:', e)
                    }
                  }
                }
              }
            }
            break
          }

          // Decode chunk and add to buffer
          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // Process complete lines (lines ending with \n)
          const lines = buffer.split('\n')
          // Keep the last incomplete line in buffer
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)

              if (data === '[DONE]') {
                break
              }

              try {
                const parsed = JSON.parse(data)
                
                if (parsed.content) {
                  accumulatedText += parsed.content
                  // Update UI immediately with accumulated text
                  // Don't trim during streaming - only clean up excessive newlines
                  setSummary(accumulatedText.replace(/\n\n\n+/g, '\n\n'))
                } else if (parsed.error) {
                  throw new Error(parsed.error)
                }
              } catch (e) {
                // Skip invalid JSON - might be partial data
                console.debug('Skipping invalid JSON line:', line.substring(0, 50), e)
                continue
              }
            }
          }
        }
      } finally {
        // Ensure reader is released
        reader.releaseLock()
      }

      // Final formatting for completed text
      const finalFormattedText = cleanMarkdownSummary(accumulatedText)
      setSummary(finalFormattedText)
      
      // Cache the summary after it's complete
      if (transcriptData) {
        setCachedVideoData(videoId, transcriptData, finalFormattedText)
      } else if (transcript) {
        setCachedVideoData(transcript.video_id, transcript, finalFormattedText)
      }
    } catch (err) {
      setSummary(null)
      // Don't show error for summary, just silently fail
      console.error('Summary generation failed:', err)
    } finally {
      setIsLoadingSummary(false)
      setIsStreaming(false)
      setThinkingText('')
      if (thinkingInterval) {
        clearInterval(thinkingInterval)
      }
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(videoUrl)
    trackEvent('video_url_copied', {
      video_url: videoUrl,
    })
  }

  const handleCopySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary)
      trackEvent('summary_copied', {
        summary_length: summary.length,
      })
    }
  }

  const handleCopyTranscript = () => {
    if (transcript) {
      const transcriptText = transcript.transcript.map(seg => seg.text).join(' ')
      navigator.clipboard.writeText(transcriptText)
      trackEvent('transcript_copied', {
        transcript_length: transcriptText.length,
      })
    }
  }

  const handleOpenInChatGPT = async () => {
    if (transcript) {
      const transcriptText = transcript.transcript.map(seg => seg.text).join(' ')
      
      try {
        // Copy transcript to clipboard
        await navigator.clipboard.writeText(transcriptText)
        
        // Show success toast
        toast.success('Transcript copied to clipboard!', {
          description: 'Paste it into ChatGPT when it opens.',
          duration: 3000,
        })
        
        // Small delay to ensure clipboard is ready
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Open ChatGPT in new tab
        const chatGPTWindow = window.open('https://chatgpt.com', '_blank', 'noopener,noreferrer')
        
        // If window was blocked, show toast
        if (!chatGPTWindow) {
          toast.error('Popup blocked', {
            description: 'Please allow popups. Transcript is copied - paste it into ChatGPT.',
            duration: 5000,
          })
        }
        
        trackEvent('transcript_opened_in_chatgpt', {
          video_id: transcript.video_id,
        })
      } catch (error) {
        console.error('Failed to copy transcript:', error)
        toast.error('Failed to copy transcript', {
          description: 'Please copy manually.',
          duration: 3000,
        })
        // Fallback: try opening ChatGPT anyway
        window.open('https://chatgpt.com', '_blank', 'noopener,noreferrer')
      }
    }
  }

  const handleDownloadTranscript = () => {
    if (transcript) {
      const transcriptText = transcript.transcript.map(seg => seg.text).join(' ')
      const blob = new Blob([transcriptText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transcript-${transcript.video_id}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      trackEvent('transcript_downloaded', {
        video_id: transcript.video_id,
      })
    }
  }

  const handleShareTranscript = () => {
    if (transcript) {
      const transcriptText = transcript.transcript.map(seg => seg.text).join(' ')
      if (navigator.share) {
        navigator.share({
          title: 'YouTube Transcript',
          text: `Transcript from YouTube video (${videoUrl}):\n\n${transcriptText.slice(0, 500)}${transcriptText.length > 500 ? '...' : ''}`,
          url: videoUrl,
        })
        trackEvent('transcript_shared_native', {
          video_id: transcript.video_id,
        })
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`Transcript from YouTube video (${videoUrl}):\n\n${transcriptText}`)
        toast.success('Transcript copied to clipboard!', {
          description: 'Ready to share anywhere.',
          duration: 3000,
        })
        trackEvent('transcript_shared_fallback', {
          video_id: transcript.video_id,
        })
      }
    }
  }

  const handleShareSummary = () => {
    if (summary) {
      if (navigator.share) {
        navigator.share({
          title: 'AI Summary',
          text: `AI Summary from YouTube video (${videoUrl}):\n\n${summary.slice(0, 500)}${summary.length > 500 ? '...' : ''}`,
          url: videoUrl,
        })
        trackEvent('summary_shared_native', {
          video_id: transcript?.video_id,
        })
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`AI Summary from YouTube video (${videoUrl}):\n\n${summary}`)
        toast.success('Summary copied to clipboard!', {
          description: 'Ready to share anywhere.',
          duration: 3000,
        })
        trackEvent('summary_shared_fallback', {
          video_id: transcript?.video_id,
        })
      }
    }
  }

  const handleShareOnTwitter = () => {
    const text = summary ?
      `Check out this AI summary from a YouTube video! ${videoUrl}` :
      `Check out the transcript from this YouTube video! ${videoUrl}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    trackEvent('shared_on_twitter', {
      video_id: transcript?.video_id,
      has_summary: !!summary,
    })
  }

  const handleShareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    trackEvent('shared_on_facebook', {
      video_id: transcript?.video_id,
      has_summary: !!summary,
    })
  }

  const handleExampleClick = async (video: (typeof exampleVideos)[0]) => {
    setSelectedExample(video.id)
    setVideoUrl(video.url)
    
    // Track example video click
    trackEvent('example_video_clicked', {
      video_id: video.id,
      video_title: video.title,
      video_url: video.url,
    })
    
    // Extract video ID
    const videoId = extractVideoId(video.url)
    if (!videoId) {
      setError("Invalid YouTube URL")
      return
    }

    // Check cache first
    const cached = getCachedVideoData(videoId)
    if (cached) {
      setTranscript(cached.transcript)
      setSummary(cached.summary)
      setIsAnalyzing(false)
      setTimeout(() => {
        transcriptSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      return
    }

    // Check if video has stored transcript
    if (video.transcript && video.transcript.trim().length > 0) {
      // Use stored transcript - instant load
      const transcriptArray = textToTranscriptSegments(video.transcript)
      const transcriptData: TranscriptData = {
        video_id: videoId,
        language: 'English',
        language_code: 'en',
        is_generated: false,
        transcript: transcriptArray
      }

      setTranscript(transcriptData)
      setIsAnalyzing(false)
      
      // Scroll to transcript section
      setTimeout(() => {
        transcriptSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      
      // Start summary generation in background (non-blocking)
      fetchSummary(videoId, video.transcript, transcriptData)
      
      // Track successful video analysis from example
      trackEvent('video_analyzed', {
        video_id: videoId,
        video_url: video.url,
        source: 'example',
        has_stored_transcript: true,
      })
      return
    }

    // No stored transcript - fetch from API
    setIsAnalyzing(true)
    setError(null)
    setTranscript(null)
    setSummary(null)

    // Scroll to results area when analysis starts
    setTimeout(() => {
      transcriptSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    try {
      // Fetch captions and timestamps in parallel (like YouTubeSummaries app)
      const [captionsResponse, timestampsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/youtube/captions?video=${videoId}&languages=en`),
        fetch(`${API_BASE_URL}/youtube/timestamps?video=${videoId}&languages=en`)
      ])

      // Check if captions request failed
      if (!captionsResponse.ok) {
        let errorMessage = `HTTP ${captionsResponse.status}: ${captionsResponse.statusText}`
        try {
          const contentType = captionsResponse.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await captionsResponse.json()
            errorMessage = errorData.detail || errorMessage
          }
        } catch (parseError) {
          console.error('Error parsing API error response:', parseError)
        }

        if (errorMessage.includes('YouTube is blocking requests') || errorMessage.includes('Could not retrieve a transcript')) {
          errorMessage = 'This video\'s captions are currently unavailable. This may be due to:\n' +
            '• The video doesn\'t have captions/subtitles enabled\n' +
            '• Temporary YouTube API restrictions\n' +
            '• The video is private or restricted\n\n' +
            'Try another video or check back later.'
        }

        throw new Error(errorMessage)
      }

      // Check if timestamps request failed
      if (!timestampsResponse.ok) {
        let errorMessage = `Failed to fetch timestamps: HTTP ${timestampsResponse.status}`
        try {
          const errorData = await timestampsResponse.json()
          errorMessage = errorData.detail || errorMessage
        } catch (parseError) {
          console.error('Error parsing timestamps error response:', parseError)
        }
        throw new Error(errorMessage)
      }

      // Parse captions response - new API returns plain text
      const captionsText = await captionsResponse.text()
      let transcriptArray: TranscriptSegment[] = []

      // Build transcript array from plain text captions
      if (captionsText && captionsText.trim().length > 0) {
        const words = captionsText.split(' ')
        transcriptArray = words.map((word: string, index: number) => ({
          text: word,
          start: index * 2,
          duration: 2
        }))
      }

      if (transcriptArray.length === 0) {
        throw new Error('No transcript data found in response')
      }

      // Parse timestamps response - new API returns array of strings, not metadata object
      const timestampsData = await timestampsResponse.json()
      let language = 'English'
      let languageCode = 'en'
      let isGenerated = false

      // New API returns array of timestamp strings, not metadata object
      // Default to English, auto-generated if we get timestamps array
      if (Array.isArray(timestampsData) && timestampsData.length > 0) {
        language = 'English'
        languageCode = 'en'
        isGenerated = true // Assume auto-generated if we only get timestamps array
      } else if (timestampsData && typeof timestampsData === 'object' && !Array.isArray(timestampsData)) {
        // Fallback: handle old API format if metadata object is returned
        if ('language' in timestampsData) language = timestampsData.language
        if ('language_code' in timestampsData) languageCode = timestampsData.language_code
        if ('is_generated' in timestampsData) isGenerated = timestampsData.is_generated
      }

      // Create transcript data structure
      const transcriptData: TranscriptData = {
        video_id: videoId,
        language,
        language_code: languageCode,
        is_generated: isGenerated,
        transcript: transcriptArray
      }

      setTranscript(transcriptData)
      setIsAnalyzing(false) // Stop loading immediately after transcript is ready
      
      // Scroll to transcript section
      setTimeout(() => {
        transcriptSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      
      // Start summary generation in background (non-blocking)
      const transcriptText = transcriptArray.map(seg => seg.text).join(' ')
      fetchSummary(videoId, transcriptText, transcriptData) // Don't await - let it run in background
      
      // Track successful video analysis from example
      trackEvent('video_analyzed', {
        video_id: videoId,
        video_url: video.url,
        source: 'example',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching the transcript")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Auto-scroll functionality
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let animationId: number | null = null

    const animate = () => {
      if (!container) return

      // On desktop: pause on hover
      // On mobile: always scroll (ignore hover)
      const shouldPause = isTouchDevice ? isUserScrolling : isHovered

      if (shouldPause) return

      if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 1) {
        // Reset to start when reaching the end
        container.scrollLeft = 0
      } else {
        container.scrollLeft += 1 // Scroll speed (increased from 0.5 for better mobile visibility)
      }

      animationId = requestAnimationFrame(animate)
    }

    if (!((isTouchDevice && isUserScrolling) || (!isTouchDevice && isHovered))) {
      animationId = requestAnimationFrame(animate)
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isHovered, isTouchDevice, isUserScrolling])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-3xl bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl">
        {/* Header */}
        <h1 className="text-primary text-xs sm:text-sm font-bold tracking-wider mb-4 sm:mb-6">ANALYZE YOUR VIDEO:</h1>

        {/* URL Input */}
        <div className="relative mb-3 sm:mb-4">
          <Input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="bg-input border-input text-foreground pr-20 sm:pr-24 h-11 sm:h-12 rounded-lg text-sm sm:text-base"
            placeholder="Enter YouTube URL"
          />
          <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 flex gap-1 sm:gap-2">
            {videoUrl && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={!videoUrl || isAnalyzing}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 sm:h-12 rounded-lg mb-6 sm:mb-8 text-sm sm:text-base"
        >
          <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5 fill-current" />
          {isAnalyzing ? "Analyzing..." : "Analyze Video"}
        </Button>

        {/* Example Videos */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-muted-foreground text-[10px] sm:text-xs font-medium tracking-wider mb-3 sm:mb-4">OR TRY AN EXAMPLE:</h2>
          <div
            ref={scrollContainerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onScroll={() => {
              // On mobile: pause auto-scroll when user manually scrolls
              if (isTouchDevice) {
                setIsUserScrolling(true)
                // Clear existing timeout
                if (userScrollTimeoutRef.current) {
                  clearTimeout(userScrollTimeoutRef.current)
                }
                // Resume auto-scroll after 2 seconds of inactivity
                userScrollTimeoutRef.current = setTimeout(() => {
                  setIsUserScrolling(false)
                }, 2000)
              }
            }}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-1 sm:-mx-2 px-1 sm:px-2 scrollbar-hide"
          >
            {exampleVideos.map((video) => (
              <button
                key={video.id}
                onClick={() => handleExampleClick(video)}
                className={`relative rounded-lg overflow-hidden transition-all shrink-0 w-28 sm:w-32 md:w-40 my-1 ${
                  selectedExample === video.id ? "ring-2 ring-primary" : "ring-1 ring-accent hover:ring-primary"
                }`}
              >
                <div className="relative w-full h-20 sm:h-24">
                  <Image
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    fill
                    className="object-cover"
                    unoptimized={!video.thumbnail?.includes('img.youtube.com')}
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent flex items-end p-1.5 sm:p-2">
                  <p className="text-white text-[10px] sm:text-xs font-medium leading-tight text-balance line-clamp-2">{video.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div ref={transcriptSectionRef} className="border-2 border-dashed border-accent rounded-lg min-h-[400px] h-[500px] sm:h-[500px] md:h-[600px] max-h-[calc(100vh-200px)] sm:max-h-none flex flex-col overflow-hidden">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8">
              <Card className="border-2 bg-card/50 backdrop-blur-sm w-full max-w-md">
                <CardContent className="flex flex-col items-center justify-center p-8 sm:p-10">
                  <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary animate-spin mb-6" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Analyzing Video</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Fetching transcript and preparing analysis...
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8">
              <X className="h-12 w-12 sm:h-16 sm:w-16 text-destructive mb-4" />
              <p className="text-destructive text-base sm:text-lg mb-2">Error</p>
              <p className="text-muted-foreground text-xs sm:text-sm whitespace-pre-line">{error}</p>
            </div>
          ) : transcript ? (
            <Tabs defaultValue="transcript" className="flex flex-col h-full min-h-0" onValueChange={(value) => {
              if (value === 'summary') {
                trackEvent('summary_viewed', {
                  has_summary: !!summary,
                  is_loading: isLoadingSummary,
                })
              }
            }}>
              <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-accent shrink-0">
                <TabsList className="gap-0 w-full sm:w-auto">
                  <TabsTrigger value="transcript" className="gap-1.5 sm:gap-2 flex-1 sm:flex-initial text-xs sm:text-sm">
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden min-[375px]:inline">Transcript</span>
                    <span className="min-[375px]:hidden">Text</span>
                  </TabsTrigger>
                  <Separator orientation="vertical" className="h-5 sm:h-6 mx-2 sm:mx-3" />
                  <TabsTrigger value="summary" className="gap-1.5 sm:gap-2 flex-1 sm:flex-initial text-xs sm:text-sm">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden min-[375px]:inline">AI Summaries</span>
                    <span className="min-[375px]:hidden">AI</span>
                    <Badge className="ml-1 text-[10px] sm:text-xs bg-[#00A6F5] text-white border-transparent px-1 sm:px-1.5">Free</Badge>
                  </TabsTrigger>
                </TabsList>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3 sm:mt-4">
                  <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                    {transcript.language} {transcript.is_generated && "(auto-generated)"} • {transcript.transcript.length} segments
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-border rounded-md overflow-hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyTranscript}
                          className="h-7 sm:h-8 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground rounded-none border-0 border-r border-border px-2 sm:px-3"
                        >
                          Copy
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 sm:h-8 text-[10px] sm:text-xs"
                          >
                            <Share2 className="h-3 w-3 mr-1" />
                            Share
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 sm:w-56">
                          <DropdownMenuItem onClick={handleShareTranscript} className="text-sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            <span>Share Transcript</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleShareOnTwitter} className="text-sm">
                            <Twitter className="h-4 w-4 mr-2" />
                            <span>Share on Twitter</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleShareOnFacebook} className="text-sm">
                            <Facebook className="h-4 w-4 mr-2" />
                            <span>Share on Facebook</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 sm:h-8 w-7 sm:w-8 p-0 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 sm:w-56">
                          <DropdownMenuItem onClick={handleOpenInChatGPT} className="text-sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            <span>Open in ChatGPT</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleDownloadTranscript} className="text-sm">
                            <Download className="h-4 w-4 mr-2" />
                            <span>Download</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled className="text-sm">
                            <Save className="h-4 w-4 mr-2" />
                            <span>Save</span>
                            <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
              <TabsContent value="transcript" className="flex-1 m-0 p-0 min-h-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="px-4 sm:px-6 py-4 sm:py-6">
                    <p className="text-foreground leading-relaxed text-xs sm:text-sm">
                      {transcript.transcript.map((segment) => segment.text).join(" ")}
                    </p>
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="summary" className="flex-1 m-0 p-0 min-h-0 overflow-hidden flex flex-col">
                {isStreaming && summary ? (
                  // Show streaming content with markdown rendering
                  <div className="relative flex-1 min-h-0">
                    <ScrollArea className="h-full">
                      <div className="px-4 sm:px-6 py-4 sm:py-6">
                        <div className="text-xs sm:text-sm text-foreground">
                          {renderMarkdown(summary)}
                          <span className="inline-block animate-pulse text-primary font-bold ml-1">▊</span>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                ) : isLoadingSummary ? (
                  // Show thinking/loading state
                  <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8">
                    <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary animate-spin mb-3" />
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      {thinkingText || 'Thinking...'}
                    </p>
                  </div>
                ) : summary ? (
                  <div className="relative flex-1 min-h-0">
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                          >
                            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 sm:w-56">
                          <DropdownMenuItem onClick={handleShareSummary} className="text-sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            <span>Share Summary</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleShareOnTwitter} className="text-sm">
                            <Twitter className="h-4 w-4 mr-2" />
                            <span>Share on Twitter</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleShareOnFacebook} className="text-sm">
                            <Facebook className="h-4 w-4 mr-2" />
                            <span>Share on Facebook</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopySummary}
                        className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    <ScrollArea className="h-full">
                      <div className="px-4 sm:px-6 py-4 sm:py-6">
                        <div className="text-xs sm:text-sm text-foreground">
                          {renderMarkdown(summary)}
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8">
                    <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-xs sm:text-sm mb-2">Summary not available</p>
                    <p className="text-muted-foreground text-[10px] sm:text-xs">The AI summary could not be generated for this video.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8">
              <Play className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-base sm:text-lg mb-2">Analysis results will appear here.</p>
              <p className="text-muted-foreground text-xs sm:text-sm">Paste a YouTube URL above or try an example.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-[10px] sm:text-xs md:text-sm mt-4 sm:mt-6">
          Powered by{" "}
          <a href={API_BASE_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/90">
            YouTube Tools API
          </a>
        </p>
      </div>
    </div>
  )
}
