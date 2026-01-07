'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Play, X, Copy, Loader2, FileText, Sparkles, Download,
  ExternalLink, Save, MoreVertical, Share2, Twitter, Facebook,
  MessageCircle, Clock, Lock, Crown, ClipboardPaste
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { trackEvent } from '@/lib/posthog'
import { useMediaQuery } from '@/lib/use-media-query'
import {
  useVideoAnalysis,
  useAutoScroll,
  extractVideoId,
  textToTranscriptSegments,
} from '@/lib/youtube'
import type { ExampleVideo, TranscriptData } from '@/lib/youtube'

// New components for 4-tab system
import { SwipeableTabs } from './swipeable-tabs'
import { VideoPlayer } from './video-player'
import { VideoCaptions } from './video-captions'
import { VideoTimestamps } from './video-timestamps'
import { VideoChat } from './video-chat'

// Example videos configuration
const EXAMPLE_VIDEOS: ExampleVideo[] = [
  { id: 1, title: 'TON 618: The Black Hole That Breaks the Universe', thumbnail: 'https://img.youtube.com/vi/i3GIzBzNAAU/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=i3GIzBzNAAU', transcript: '' },
  { id: 2, title: "Life's most important moments are flukes, not fate", thumbnail: 'https://img.youtube.com/vi/IaBn3McvJI8/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=IaBn3McvJI8', transcript: '' },
  { id: 3, title: 'Micro-interactions to delight your users', thumbnail: 'https://img.youtube.com/vi/jgrkV_hJdJw/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=jgrkV_hJdJw', transcript: '' },
  { id: 4, title: 'Good News For Startups: Enterprise Is Bad At AI', thumbnail: 'https://img.youtube.com/vi/DULfEcPR0Gc/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=DULfEcPR0Gc', transcript: '' },
  { id: 5, title: 'Every Type Of API You Must Know Explained!', thumbnail: 'https://img.youtube.com/vi/pBASqUbZgkY/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=pBASqUbZgkY', transcript: '' },
  { id: 6, title: 'RIP Deepseek. We have a new #1 open-source AI model', thumbnail: 'https://img.youtube.com/vi/xt6_zIKeX6A/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=xt6_zIKeX6A', transcript: '' },
  { id: 7, title: 'How I use Claude Code for real engineering', thumbnail: 'https://img.youtube.com/vi/kZ-zzHVUrO4/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=kZ-zzHVUrO4', transcript: '' },
  { id: 8, title: 'The Age of Laser Warfare Has Begun', thumbnail: 'https://img.youtube.com/vi/8VLovd9bS5U/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=8VLovd9bS5U', transcript: '' },
  { id: 9, title: 'The Louvre: The Wildest Robbery of the 21st Century', thumbnail: 'https://img.youtube.com/vi/4NsAMEKcawA/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=4NsAMEKcawA', transcript: '' },
  { id: 10, title: 'AI-Piloted Fighter Drone About To Transform Warfare', thumbnail: 'https://img.youtube.com/vi/ZA_QzeN8fCs/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=ZA_QzeN8fCs', transcript: '' },
  { id: 11, title: 'DeepSeek OCR - More than OCR', thumbnail: 'https://img.youtube.com/vi/YEZHU4LSUfU/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=YEZHU4LSUfU', transcript: '' },
  { id: 12, title: "Willpower won't save you from bad habits", thumbnail: 'https://img.youtube.com/vi/vSxomJb2KGE/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=vSxomJb2KGE', transcript: '' },
]

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api1.youtubesummaries.cc'

// Markdown renderer component
function MarkdownContent({ text }: { text: string }) {
  if (!text) return null

  return (
    <div className="prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none">
      <ReactMarkdown
        components={{
          h1: (props) => <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-6 mb-4" {...props} />,
          h2: (props) => <h2 className="text-lg sm:text-xl font-bold text-foreground mt-5 mb-3" {...props} />,
          h3: (props) => <h3 className="text-sm sm:text-base font-bold mt-4 mb-2 text-[#00A5F4] leading-tight" {...props} />,
          h4: (props) => <h4 className="text-xs sm:text-sm font-bold mt-3 mb-1.5 text-[#00A5F4]" {...props} />,
          p: (props) => <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mb-2 sm:mb-3" {...props} />,
          ul: (props) => <ul className="list-disc ml-4 sm:ml-6 my-2 space-y-1" {...props} />,
          ol: (props) => <ol className="list-decimal ml-4 sm:ml-6 my-2 space-y-1" {...props} />,
          li: (props) => <li className="text-xs sm:text-sm text-foreground/90" {...props} />,
          code: ({ className, children, ...props }) => {
            const isInline = !/language-(\w+)/.exec(className || '')
            return isInline ? (
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs sm:text-sm font-mono text-foreground" {...props}>
                {children}
              </code>
            ) : (
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-3 my-3">
                <code className={className} {...props}>{children}</code>
              </pre>
            )
          },
          a: ({ children, ...props }) => (
            <a className="text-primary underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
          blockquote: (props) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/80 my-3" {...props} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

// Loading state component
function AnalyzingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 sm:p-10">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary animate-spin mb-4" />
          <CardTitle className="text-base sm:text-lg mb-2">Analyzing Video</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            Fetching transcript and preparing analysis...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8 min-h-[400px]">
      <div className="mb-6">
        <Play className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto" />
      </div>
      <CardTitle className="text-base sm:text-lg mb-2 text-muted-foreground">
        Analysis results will appear here
      </CardTitle>
      <p className="text-muted-foreground text-xs sm:text-sm">
        Paste a YouTube URL above or try an example.
      </p>
    </div>
  )
}

// Error state component
function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8">
      <div className="mb-6">
        <X className="h-12 w-12 sm:h-16 sm:w-16 text-destructive mx-auto" />
      </div>
      <CardTitle className="text-base sm:text-lg mb-2 text-destructive">Error</CardTitle>
      <p className="text-muted-foreground text-xs sm:text-sm whitespace-pre-line max-w-md">{error}</p>
    </div>
  )
}

// Pro upgrade prompt component
function ProUpgradePrompt({ feature }: { feature: string }) {
  // Use /api/checkout which will use default POLAR_PRODUCT_ID from server
  const checkoutUrl = `/api/checkout`
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8">
      <div className="mb-6 relative">
        <Crown className="h-16 w-16 sm:h-20 sm:w-20 text-primary mb-4 mx-auto" />
        <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground absolute -bottom-2 -right-2 bg-background rounded-full p-1" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
        {feature} is a Pro Feature
      </h3>
      <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-md">
        Upgrade to Pro to unlock AI-powered summaries, chat with videos, and more premium features.
      </p>
      <Button asChild size="lg" className="gap-2">
        <Link href={checkoutUrl}>
          <Crown className="h-4 w-4" />
          Upgrade to Pro
        </Link>
      </Button>
    </div>
  )
}

// Video Results Content Component (reusable for Drawer/Sheet)
function VideoResultsContent({
  transcript,
  currentVideoId,
  activeTab,
  setActiveTab,
  isPro,
  summary,
  isLoadingSummary,
  isStreaming,
  thinkingText,
  handleCopySummary,
  handleDownloadTranscript,
  handleOpenInChatGPT,
  handleTimestampClick,
}: {
  transcript: TranscriptData
  currentVideoId: string
  activeTab: string
  setActiveTab: (tab: string) => void
  isPro: boolean
  summary: string | null
  isLoadingSummary: boolean
  isStreaming: boolean
  thinkingText: string
  handleCopySummary: () => void
  handleDownloadTranscript: () => void
  handleOpenInChatGPT: () => void
  handleTimestampClick: (seconds: number) => void
}) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* SwipeableTabs with 4 tabs */}
      <SwipeableTabs
        defaultValue="captions"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="px-2 sm:px-4 md:px-6 pt-1 sm:pt-1.5 shrink-0">
          <SwipeableTabs.List className="grid grid-cols-4 gap-0.5 sm:gap-1">
            <SwipeableTabs.Trigger 
              value="captions" 
              className="text-[11px] sm:text-xs md:text-sm px-1 sm:px-1.5 md:px-3 py-2.5 sm:py-2.5 md:py-3"
              title="Captions"
            >
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden min-[360px]:inline truncate max-w-[60px] sm:max-w-none ml-0.5 sm:ml-1.5">Captions</span>
            </SwipeableTabs.Trigger>
            <SwipeableTabs.Trigger 
              value="timestamps" 
              className="text-[11px] sm:text-xs md:text-sm px-1 sm:px-1.5 md:px-3 py-2.5 sm:py-2.5 md:py-3"
              title="Timestamps"
            >
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden min-[360px]:inline truncate max-w-[60px] sm:max-w-none ml-0.5 sm:ml-1.5">Timestamps</span>
            </SwipeableTabs.Trigger>
            <SwipeableTabs.Trigger 
              value="summary" 
              className="text-[11px] sm:text-xs md:text-sm px-1 sm:px-1.5 md:px-3 py-2.5 sm:py-2.5 md:py-3 relative"
              title="Summary"
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden min-[360px]:inline truncate max-w-[60px] sm:max-w-none ml-0.5 sm:ml-1.5">Summary</span>
              {!isPro && (
                <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3 absolute -top-0.5 -right-0.5 sm:top-0.5 sm:right-0.5 text-primary bg-background rounded-full p-0.5 shadow-md border border-primary/20" />
              )}
            </SwipeableTabs.Trigger>
            <SwipeableTabs.Trigger 
              value="chat" 
              className="text-[11px] sm:text-xs md:text-sm px-1 sm:px-1.5 md:px-3 py-2.5 sm:py-2.5 md:py-3 relative"
              title="Chat"
            >
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden min-[360px]:inline truncate max-w-[60px] sm:max-w-none ml-0.5 sm:ml-1.5">Chat</span>
              {!isPro && (
                <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3 absolute -top-0.5 -right-0.5 sm:top-0.5 sm:right-0.5 text-primary bg-background rounded-full p-0.5 shadow-md border border-primary/20" />
              )}
            </SwipeableTabs.Trigger>
          </SwipeableTabs.List>
        </div>

        {/* Captions Tab */}
        <SwipeableTabs.Content value="captions" className="flex-1 min-h-0">
          <VideoCaptions
            videoId={currentVideoId}
            captions={transcript.transcript.map(s => s.text).join(' ')}
            onDownload={handleDownloadTranscript}
            onOpenInChatGPT={handleOpenInChatGPT}
          />
        </SwipeableTabs.Content>

        {/* Timestamps Tab */}
        <SwipeableTabs.Content value="timestamps" className="flex-1 min-h-0">
          <VideoTimestamps
            videoId={currentVideoId}
            onTimestampClick={handleTimestampClick}
          />
        </SwipeableTabs.Content>

        {/* Summary Tab (Pro Protected) */}
        <SwipeableTabs.Content value="summary" className="flex-1 min-h-0">
          <Card className="h-full flex flex-col border-0 shadow-none bg-transparent">
            {!isPro ? (
              <CardContent className="flex-1 flex items-center justify-center">
                <ProUpgradePrompt feature="AI Summary" />
              </CardContent>
            ) : isStreaming && summary ? (
              <>
                <CardHeader className="pb-3 space-y-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base font-semibold">AI Summary</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs font-normal animate-pulse">
                      Generating...
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-4 sm:p-6">
                  <div className="prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none">
                    <MarkdownContent text={summary} />
                    <span className="inline-block animate-pulse text-primary font-bold ml-1">▊</span>
                  </div>
                </CardContent>
              </>
            ) : isLoadingSummary ? (
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary animate-spin mb-3" />
                <p className="text-muted-foreground text-xs sm:text-sm font-medium">{thinkingText || 'Thinking...'}</p>
                <p className="text-muted-foreground text-[10px] sm:text-xs mt-1">Analyzing video content</p>
              </CardContent>
            ) : summary ? (
              <>
                <CardHeader className="pb-3 space-y-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base font-semibold">AI Summary</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopySummary}
                      className="h-8 gap-2 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Copy</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-4 sm:p-6">
                  <MarkdownContent text={summary} />
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8">
                <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base font-medium mb-2">Summary not available</p>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  The AI summary could not be generated for this video.
                </p>
              </CardContent>
            )}
          </Card>
        </SwipeableTabs.Content>

        {/* Chat Tab (Pro Protected) */}
        <SwipeableTabs.Content value="chat" className="flex-1 min-h-0">
          {!isPro ? (
            <ProUpgradePrompt feature="AI Chat" />
          ) : (
            <VideoChat videoId={currentVideoId} />
          )}
        </SwipeableTabs.Content>
      </SwipeableTabs>
    </div>
  )
}

// Main component
export default function VideoAnalyzer() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [videoUrl, setVideoUrl] = useState('')
  const [selectedExample, setSelectedExample] = useState<number | null>(null)
  const [seekToTime, setSeekToTime] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('captions')
  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [isLoadingPro, setIsLoadingPro] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Responsive: use Drawer on mobile, Sheet on desktop
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  // Control drawer/sheet open state
  const [isResultsOpen, setIsResultsOpen] = useState(false)

  // Check pro status (authentication check removed - home page is public)
  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const response = await fetch('/api/user/subscription')
        const data = await response.json()
        setIsPro(data.isPro || false)
        setIsAuthenticated(true) // Set to true if we get a response
      } catch (error) {
        console.warn('Error checking pro status:', error)
        setIsPro(false)
        setIsAuthenticated(true) // Allow public access - don't block
      } finally {
        setIsLoadingPro(false)
      }
    }
    checkProStatus()
  }, [])

  // Get current video ID for the player
  const currentVideoId = extractVideoId(videoUrl)

  // Handler for timestamp clicks
  const handleTimestampClick = (seconds: number) => {
    setSeekToTime(seconds)
    trackEvent('timestamp_clicked', { seconds, video_id: currentVideoId })
  }

  const handleSeekComplete = () => {
    setSeekToTime(null)
  }

  const {
    transcript,
    summary,
    error,
    isLoadingTranscript,
    isLoadingSummary,
    isStreaming,
    thinkingText,
    analyze,
    reset,
    cache,
    setTranscriptDirect,
    setSummaryDirect,
    generateSummary,
  } = useVideoAnalysis()

  const { handlers: scrollHandlers } = useAutoScroll(scrollContainerRef)

  // Auto-analyze when video param is in URL (from channel page clicks or search)
  useEffect(() => {
    const videoParam = searchParams.get('video')
    if (videoParam && !hasAutoAnalyzed) {
      const newUrl = `https://www.youtube.com/watch?v=${videoParam}`
      // Don't populate the URL field - just analyze silently
      setSelectedExample(null)
      setHasAutoAnalyzed(true)

      // Delay to let state update, then analyze (no auto-scroll)
      setTimeout(() => {
        analyze(newUrl).then((success) => {
          if (success) {
            trackEvent('video_analyzed_from_channel', {
              video_id: videoParam,
            })
          }
        })
        // Removed auto-scroll on page load
      }, 100)
    }
  }, [searchParams, hasAutoAnalyzed, analyze])

  // Open results drawer/sheet when transcript is loaded
  useEffect(() => {
    if (transcript && currentVideoId) {
      setIsResultsOpen(true)
    }
  }, [transcript, currentVideoId])
  
  // Handle closing results
  const handleCloseResults = useCallback((open: boolean) => {
    setIsResultsOpen(open)
    if (!open) {
      // Optional: reset when closed, or keep data for quick reopen
      // reset()
    }
  }, [])

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) return
    
    const success = await analyze(videoUrl)
    if (success) {
      trackEvent('video_analyzed', {
        video_id: extractVideoId(videoUrl),
        video_url: videoUrl,
      })
      // Results will auto-open via useEffect when transcript loads
    }
  }

  const handleClear = () => {
    setVideoUrl('')
    reset()
  }

  const handleExampleClick = async (video: ExampleVideo) => {
    setSelectedExample(video.id)
    setVideoUrl(video.url)

    trackEvent('example_video_clicked', {
      video_id: video.id,
      video_title: video.title,
      video_url: video.url,
    })

    const videoId = extractVideoId(video.url)
    if (!videoId) return

    // Check cache
    const cached = cache.get(videoId)
    if (cached) {
      setTranscriptDirect(cached.transcript)
      setSummaryDirect(cached.summary)
      // Results will auto-open via useEffect
      return
    }

    // Use stored transcript if available
    if (video.transcript?.trim()) {
      const transcriptArray = textToTranscriptSegments(video.transcript)
      const transcriptData: TranscriptData = {
        video_id: videoId,
        language: 'English',
        language_code: 'en',
        is_generated: false,
        transcript: transcriptArray,
      }
      setTranscriptDirect(transcriptData)
      // Results will auto-open via useEffect
      generateSummary(video.transcript, videoId, (completedSummary) => {
        cache.set(videoId, transcriptData, completedSummary)
      })
      return
    }

    // Fetch from API
    await analyze(video.url)
    // Results will auto-open via useEffect when transcript loads
  }

  // Action handlers
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setVideoUrl(text)
      trackEvent('video_url_pasted', { video_url: text })
    } catch (err) {
      toast.error('Failed to paste from clipboard')
      console.error('Paste failed:', err)
    }
  }

  const handleCopySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary)
      toast.success('Summary copied!')
      trackEvent('summary_copied', { summary_length: summary.length })
    }
  }

  const handleCopyTranscript = () => {
    if (transcript) {
      const text = transcript.transcript.map(s => s.text).join(' ')
      navigator.clipboard.writeText(text)
      toast.success('Transcript copied!')
      trackEvent('transcript_copied', { transcript_length: text.length })
    }
  }

  const handleDownloadTranscript = () => {
    if (transcript) {
      const text = transcript.transcript.map(s => s.text).join(' ')
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transcript-${transcript.video_id}.txt`
      a.click()
      URL.revokeObjectURL(url)
      trackEvent('transcript_downloaded', { video_id: transcript.video_id })
    }
  }

  const handleOpenInChatGPT = async () => {
    if (!transcript) return

    const text = transcript.transcript.map(s => s.text).join(' ')
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Transcript copied!', { description: 'Paste it into ChatGPT when it opens.' })
      await new Promise(r => setTimeout(r, 200))
      const win = window.open('https://chatgpt.com', '_blank', 'noopener,noreferrer')
      if (!win) toast.error('Popup blocked', { description: 'Please allow popups.' })
      trackEvent('transcript_opened_in_chatgpt', { video_id: transcript.video_id })
    } catch {
      toast.error('Failed to copy')
      window.open('https://chatgpt.com', '_blank', 'noopener,noreferrer')
    }
  }

  const handleShare = (type: 'transcript' | 'summary') => {
    const text = type === 'transcript' && transcript
      ? transcript.transcript.map(s => s.text).join(' ')
      : summary

    if (!text) return

    const shareText = `${type === 'transcript' ? 'Transcript' : 'AI Summary'} from YouTube video (${videoUrl}):\n\n${text.slice(0, 500)}${text.length > 500 ? '...' : ''}`

    if (navigator.share) {
      navigator.share({ title: type === 'transcript' ? 'YouTube Transcript' : 'AI Summary', text: shareText, url: videoUrl })
    } else {
      navigator.clipboard.writeText(shareText)
      toast.success('Copied to clipboard!')
    }
    trackEvent(`${type}_shared`, { video_id: transcript?.video_id })
  }

  const handleShareTwitter = () => {
    const text = summary ? `Check out this AI summary! ${videoUrl}` : `Check out this transcript! ${videoUrl}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
    trackEvent('shared_on_twitter', { video_id: transcript?.video_id })
  }

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`, '_blank')
    trackEvent('shared_on_facebook', { video_id: transcript?.video_id })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-3xl bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl">
        {/* Header */}
        <h1 className="text-primary text-xs sm:text-sm font-bold tracking-wider mb-4 sm:mb-6">
          ANALYZE YOUR VIDEO:
        </h1>

        {/* URL Input with Paste and Analyze */}
        <div className="relative mb-6 sm:mb-8">
          <div className="flex items-center gap-0 border border-border rounded-lg bg-background overflow-hidden shadow-sm">
            {/* Paste Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePaste}
              className="h-11 sm:h-12 w-11 sm:w-12 rounded-none border-0 hover:bg-muted/50 text-muted-foreground hover:text-foreground shrink-0"
              title="Paste URL"
            >
              <ClipboardPaste className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            {/* Separator */}
            <div className="h-6 w-px bg-border/50" />
            
            {/* Input */}
            <Input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="flex-1 border-0 bg-transparent text-foreground h-11 sm:h-12 rounded-none text-sm sm:text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
              placeholder="Enter YouTube URL"
            />
            
            {/* Clear Button (when there's text) */}
            {videoUrl && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className="h-11 sm:h-12 w-11 sm:w-12 rounded-none border-0 hover:bg-muted/50 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <div className="h-6 w-px bg-border/50" />
              </>
            )}
            
            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={!videoUrl || isLoadingTranscript}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 sm:h-12 rounded-none border-0 px-6 sm:px-8 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5 fill-current" />
              <span className="hidden sm:inline">{isLoadingTranscript ? 'Analyzing...' : 'Analyze Video'}</span>
              <span className="sm:hidden">{isLoadingTranscript ? '...' : 'Analyze'}</span>
            </Button>
          </div>
        </div>

        {/* Example Videos */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-muted-foreground text-[10px] sm:text-xs font-medium tracking-wider mb-3 sm:mb-4">
            OR TRY AN EXAMPLE:
          </h2>
          <div
            ref={scrollContainerRef}
            {...scrollHandlers}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-1 sm:-mx-2 px-1 sm:px-2 scrollbar-hide"
          >
            {EXAMPLE_VIDEOS.map((video) => (
              <button
                key={video.id}
                onClick={() => handleExampleClick(video)}
                className={`relative rounded-lg overflow-hidden transition-all shrink-0 w-28 sm:w-32 md:w-40 my-1 ${
                  selectedExample === video.id ? 'ring-2 ring-primary' : 'ring-1 ring-accent hover:ring-primary'
                }`}
              >
                <div className="relative w-full h-20 sm:h-24">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-1.5 sm:p-2">
                  <p className="text-white text-[10px] sm:text-xs font-medium leading-tight line-clamp-2">
                    {video.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Video Player (shown when video is loaded) */}
        {currentVideoId && transcript && (
          <div className="mb-4 sm:mb-6">
            <VideoPlayer
              videoId={currentVideoId}
              seekToTime={seekToTime}
              onSeekComplete={handleSeekComplete}
            />
          </div>
        )}

        {/* Empty State (shown when no results) */}
        {!transcript && !isLoadingTranscript && !error && (
          <div className="rounded-lg min-h-[400px] flex flex-col overflow-hidden bg-muted/30">
            <EmptyState />
          </div>
        )}

        {/* Loading State */}
        {isLoadingTranscript && (
          <div className="rounded-lg min-h-[400px] flex flex-col overflow-hidden bg-muted/30">
            <AnalyzingState />
          </div>
        )}

        {/* Error State */}
        {error && !isLoadingTranscript && (
          <div className="rounded-lg min-h-[400px] flex flex-col overflow-hidden bg-muted/30">
            <ErrorState error={error} />
          </div>
        )}

        {/* Results in Drawer (Mobile) or Modal (Desktop) */}
        {isMobile ? (
          <Drawer open={isResultsOpen} onOpenChange={handleCloseResults} direction="bottom">
            <DrawerContent className="max-h-[90vh] flex flex-col">
              <DrawerHeader className="text-left shrink-0">
                <DrawerTitle>Video Analysis</DrawerTitle>
                {transcript && (
                  <DrawerDescription className="flex items-center gap-2 flex-wrap mt-2">
                    <Badge variant="secondary" className="text-[10px] sm:text-xs font-normal">
                      {transcript.language}
                    </Badge>
                    {transcript.is_generated && (
                      <Badge variant="outline" className="text-[10px] sm:text-xs font-normal">
                        auto-generated
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px] sm:text-xs font-normal">
                      {transcript.transcript.length.toLocaleString()} segments
                    </Badge>
                  </DrawerDescription>
                )}
              </DrawerHeader>
              {transcript && currentVideoId && (
                <div className="flex-1 min-h-0 overflow-hidden px-4 pb-4">
                  <VideoResultsContent
                    transcript={transcript}
                    currentVideoId={currentVideoId}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isPro={isPro}
                    summary={summary}
                    isLoadingSummary={isLoadingSummary}
                    isStreaming={isStreaming}
                    thinkingText={thinkingText}
                    handleCopySummary={handleCopySummary}
                    handleDownloadTranscript={handleDownloadTranscript}
                    handleOpenInChatGPT={handleOpenInChatGPT}
                    handleTimestampClick={handleTimestampClick}
                  />
                </div>
              )}
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={isResultsOpen} onOpenChange={handleCloseResults}>
            <DialogContent className="max-w-[640px] w-full max-h-[90vh] flex flex-col p-0 gap-0">
              <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
                <DialogTitle>Video Analysis</DialogTitle>
                {transcript && (
                  <DialogDescription asChild>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <Badge variant="secondary" className="text-[10px] sm:text-xs font-normal">
                        {transcript.language}
                      </Badge>
                      {transcript.is_generated && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs font-normal">
                          auto-generated
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px] sm:text-xs font-normal">
                        {transcript.transcript.length.toLocaleString()} segments
                      </Badge>
                    </div>
                  </DialogDescription>
                )}
              </DialogHeader>
              {transcript && currentVideoId && (
                <div className="flex-1 min-h-0 overflow-hidden px-6 pb-6">
                  <VideoResultsContent
                    transcript={transcript}
                    currentVideoId={currentVideoId}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isPro={isPro}
                    summary={summary}
                    isLoadingSummary={isLoadingSummary}
                    isStreaming={isStreaming}
                    thinkingText={thinkingText}
                    handleCopySummary={handleCopySummary}
                    handleDownloadTranscript={handleDownloadTranscript}
                    handleOpenInChatGPT={handleOpenInChatGPT}
                    handleTimestampClick={handleTimestampClick}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Footer */}
        <p className="text-center text-muted-foreground text-[10px] sm:text-xs md:text-sm mt-4 sm:mt-6">
          Powered by{' '}
          <a href={API_BASE_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/90">
            YouTube Tools API
          </a>
        </p>
      </div>
    </div>
  )
}
