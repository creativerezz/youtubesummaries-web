'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { TranscriptData, CachedVideoData } from './types'
import {
  extractVideoId,
  fetchVideoTranscript,
  streamSummary,
  cleanMarkdownSummary,
} from './api'

// Cache configuration
const CACHE_KEY_PREFIX = 'yt_demo_'
const CACHE_EXPIRY_HOURS = 24

/**
 * Hook for managing video data cache in localStorage
 */
export function useVideoCache() {
  const get = useCallback((videoId: string): CachedVideoData | null => {
    if (typeof window === 'undefined') return null

    try {
      const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${videoId}`)
      if (!cached) return null

      const parsed: CachedVideoData = JSON.parse(cached)
      const expiryMs = CACHE_EXPIRY_HOURS * 60 * 60 * 1000

      if (Date.now() - parsed.timestamp > expiryMs) {
        localStorage.removeItem(`${CACHE_KEY_PREFIX}${videoId}`)
        return null
      }

      return parsed
    } catch {
      return null
    }
  }, [])

  const set = useCallback((
    videoId: string,
    transcript: TranscriptData,
    summary: string
  ): void => {
    if (typeof window === 'undefined') return

    try {
      const data: CachedVideoData = {
        transcript,
        summary,
        timestamp: Date.now(),
      }
      localStorage.setItem(`${CACHE_KEY_PREFIX}${videoId}`, JSON.stringify(data))
    } catch (error) {
      console.error('Cache write error:', error)
    }
  }, [])

  const has = useCallback((videoId: string): boolean => {
    return get(videoId) !== null
  }, [get])

  return { get, set, has }
}

/**
 * Hook for fetching and managing transcript data
 */
export function useTranscript() {
  const [transcript, setTranscript] = useState<TranscriptData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (videoUrl: string): Promise<TranscriptData | null> => {
    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      setError('Invalid YouTube URL')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchVideoTranscript(videoId, videoUrl)
      setTranscript(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transcript'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setTranscript(null)
    setError(null)
    setIsLoading(false)
  }, [])

  const setDirect = useCallback((data: TranscriptData) => {
    setTranscript(data)
    setError(null)
  }, [])

  return {
    transcript,
    isLoading,
    error,
    fetch,
    reset,
    setDirect,
  }
}

const THINKING_MESSAGES = [
  'Thinking...',
  'Analyzing transcript...',
  'Extracting key insights...',
  'Summarizing content...',
  'Processing information...',
]

/**
 * Hook for streaming AI summaries
 */
export function useSummary() {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [thinkingText, setThinkingText] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startThinking = useCallback(() => {
    let index = 0
    setThinkingText(THINKING_MESSAGES[0])

    thinkingIntervalRef.current = setInterval(() => {
      index = (index + 1) % THINKING_MESSAGES.length
      setThinkingText(THINKING_MESSAGES[index])
    }, 2000)
  }, [])

  const stopThinking = useCallback(() => {
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current)
      thinkingIntervalRef.current = null
    }
    setThinkingText('')
  }, [])

  const generate = useCallback(async (
    transcript: string,
    videoId: string,
    onComplete?: (summary: string) => void
  ): Promise<string | null> => {
    // Cancel any existing request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    setIsStreaming(false)
    setSummary(null)
    startThinking()

    let accumulated = ''

    try {
      await streamSummary(
        transcript,
        videoId,
        // onChunk
        (content) => {
          if (!isStreaming) {
            stopThinking()
            setIsStreaming(true)
          }
          accumulated += content
          setSummary(accumulated.replace(/\n\n\n+/g, '\n\n'))
        },
        // onComplete
        (fullText) => {
          const cleaned = cleanMarkdownSummary(fullText)
          setSummary(cleaned)
          onComplete?.(cleaned)
        },
        // onError
        (error) => {
          console.error('Summary error:', error)
          setSummary(null)
        },
        abortControllerRef.current.signal
      )

      return cleanMarkdownSummary(accumulated)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Summary generation failed:', err)
      }
      return null
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      stopThinking()
    }
  }, [startThinking, stopThinking, isStreaming])

  const reset = useCallback(() => {
    abortControllerRef.current?.abort()
    setSummary(null)
    setIsLoading(false)
    setIsStreaming(false)
    stopThinking()
  }, [stopThinking])

  const setDirect = useCallback((text: string) => {
    setSummary(text)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      stopThinking()
    }
  }, [stopThinking])

  return {
    summary,
    isLoading,
    isStreaming,
    thinkingText,
    generate,
    reset,
    setDirect,
  }
}

/**
 * Combined hook for full video analysis flow
 */
export function useVideoAnalysis() {
  const cache = useVideoCache()
  const {
    transcript,
    isLoading: isLoadingTranscript,
    error,
    fetch: fetchTranscript,
    reset: resetTranscript,
    setDirect: setTranscriptDirect,
  } = useTranscript()

  const {
    summary,
    isLoading: isLoadingSummary,
    isStreaming,
    thinkingText,
    generate: generateSummary,
    reset: resetSummary,
    setDirect: setSummaryDirect,
  } = useSummary()

  const analyze = useCallback(async (
    videoUrl: string,
    options?: { skipCache?: boolean }
  ): Promise<boolean> => {
    const videoId = extractVideoId(videoUrl)
    if (!videoId) return false

    // Check cache first
    if (!options?.skipCache) {
      const cached = cache.get(videoId)
      if (cached) {
        setTranscriptDirect(cached.transcript)
        setSummaryDirect(cached.summary)
        return true
      }
    }

    // Fetch transcript
    const transcriptData = await fetchTranscript(videoUrl)
    if (!transcriptData) return false

    // Generate summary in background
    const transcriptText = transcriptData.transcript.map(s => s.text).join(' ')
    generateSummary(transcriptText, videoId, (completedSummary) => {
      cache.set(videoId, transcriptData, completedSummary)
    })

    return true
  }, [cache, fetchTranscript, generateSummary, setTranscriptDirect, setSummaryDirect])

  const reset = useCallback(() => {
    resetTranscript()
    resetSummary()
  }, [resetTranscript, resetSummary])

  return {
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
  }
}

/**
 * Hook for auto-scrolling carousel
 */
export function useAutoScroll(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options?: { speed?: number; pauseOnHover?: boolean }
) {
  const { speed = 1, pauseOnHover = true } = options || {}
  const [isHovered, setIsHovered] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  // Initialize touch device detection lazily to avoid setState in effect
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationId: number | null = null

    const animate = () => {
      if (!container) return

      const shouldPause = isTouchDevice ? isUserScrolling : (pauseOnHover && isHovered)
      if (shouldPause) return

      if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 1) {
        container.scrollLeft = 0
      } else {
        container.scrollLeft += speed
      }

      animationId = requestAnimationFrame(animate)
    }

    const shouldStart = !(isTouchDevice ? isUserScrolling : (pauseOnHover && isHovered))
    if (shouldStart) {
      animationId = requestAnimationFrame(animate)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [containerRef, isHovered, isTouchDevice, isUserScrolling, pauseOnHover, speed])

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  const handleScroll = useCallback(() => {
    if (!isTouchDevice) return

    setIsUserScrolling(true)
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current)
    }
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false)
    }, 2000)
  }, [isTouchDevice])

  useEffect(() => {
    return () => {
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current)
      }
    }
  }, [])

  return {
    isHovered,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onScroll: handleScroll,
    },
  }
}
