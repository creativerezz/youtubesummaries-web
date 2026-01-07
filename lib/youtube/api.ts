// YouTube API service layer

import type { TranscriptSegment, TranscriptData } from './types'
import { fetchCaptions, fetchTimestamps, fetchVideoData } from '@/lib/youtube-transcript-api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api1.youtubesummaries.cc'

// Demo transcript for fallback when all APIs fail
const DEMO_TRANSCRIPT: TranscriptData = {
  video_id: 'demo',
  language: 'English',
  language_code: 'en',
  is_generated: true,
  isDemo: true,
  transcript: [
    { text: 'This', start: 0, duration: 0.5 },
    { text: 'is', start: 0.5, duration: 0.5 },
    { text: 'demo', start: 1, duration: 0.5 },
    { text: 'transcript', start: 1.5, duration: 0.5 },
    { text: 'data.', start: 2, duration: 0.5 },
    { text: 'The', start: 3, duration: 0.5 },
    { text: 'actual', start: 3.5, duration: 0.5 },
    { text: 'transcript', start: 4, duration: 0.5 },
    { text: 'could', start: 4.5, duration: 0.5 },
    { text: 'not', start: 5, duration: 0.5 },
    { text: 'be', start: 5.5, duration: 0.5 },
    { text: 'fetched', start: 6, duration: 0.5 },
    { text: 'due', start: 6.5, duration: 0.5 },
    { text: 'to', start: 7, duration: 0.5 },
    { text: 'API', start: 7.5, duration: 0.5 },
    { text: 'limitations.', start: 8, duration: 0.5 },
  ],
} as TranscriptData & { isDemo?: boolean }

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  // If it's already a video ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim()
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * Convert plain text to transcript segments with approximate timing
 */
export function textToTranscriptSegments(text: string): TranscriptSegment[] {
  const words = text.split(' ')
  return words.map((word, index) => ({
    text: word,
    start: index * 2,
    duration: 2
  }))
}

/**
 * Fetch transcript from FastAPI backend
 */
export async function fetchVideoTranscript(
  videoId: string,
  videoUrl: string
): Promise<TranscriptData> {
  try {
    // Fetch timestamps from the new API (returns TimestampEntry[])
    const timestampsData = await fetchTimestamps(videoUrl, ['en'])

    // If we have timestamp data, use it directly
    if (timestampsData && timestampsData.length > 0) {
      return {
        video_id: videoId,
        language: 'English',
        language_code: 'en',
        is_generated: false,
        transcript: timestampsData.map(entry => ({
          text: entry.text,
          start: entry.start,
          duration: entry.duration
        }))
      }
    }

    // Fallback: fetch captions only if timestamps failed
    const captions = await fetchCaptions(videoUrl, ['en'])

    if (!captions || !captions.trim()) {
      throw new Error('No transcript data found')
    }

    return {
      video_id: videoId,
      language: 'English',
      language_code: 'en',
      is_generated: true,
      transcript: textToTranscriptSegments(captions)
    }
  } catch (error) {
    console.warn('FastAPI transcript fetch failed:', error)
    throw error
  }
}

/**
 * Stream summary from API
 */
export async function streamSummary(
  transcript: string,
  videoId: string,
  onChunk: (content: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript,
      videoId,
      userId: 'anonymous',
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error('Failed to fetch summary')
  }

  if (!response.body) {
    throw new Error('Streaming not supported')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        const final = decoder.decode()
        if (final) buffer += final
        processBuffer(buffer, (content) => {
          accumulated += content
          onChunk(content)
        })
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              accumulated += parsed.content
              onChunk(parsed.content)
            } else if (parsed.error) {
              throw new Error(parsed.error)
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    onComplete(accumulated)
  } finally {
    reader.releaseLock()
  }
}

function processBuffer(
  buffer: string,
  onContent: (content: string) => void
): void {
  if (!buffer.trim()) return

  const lines = buffer.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('data: ')) {
      const data = trimmed.slice(6)
      if (data !== '[DONE]') {
        try {
          const parsed = JSON.parse(data)
          if (parsed.content) onContent(parsed.content)
        } catch {
          // Skip
        }
      }
    }
  }
}

/**
 * Clean markdown output from AI
 */
export function cleanMarkdownSummary(text: string): string {
  if (!text) return text

  return text
    .replace(/\[\d+:\d+\]/g, '')
    .replace(/\[\d{1,3}:\d{1,2}\]/g, '')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\*\*Takeaway:\*\*\s*/g, '\n\n**Takeaway:**\n\n')
    .replace(/\*\*Final takeaway:\*\*\s*/g, '\n\n**Final takeaway:**\n\n')
    .replace(/-{3,}/g, '---')
    .replace(/\n-{3}\n/g, '\n\n---\n\n')
    .replace(/(#{1,6}\s+.+)\n([^\n\s])/g, '$1\n\n$2')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/```\n\n/g, '```\n')
    .replace(/\n\n```/g, '\n```')
    .trim()
}

/**
 * Fetch video timestamps from API
 * Returns array of timestamp objects
 */
export async function fetchVideoTimestamps(videoId: string): Promise<TranscriptSegment[]> {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const timestamps = await fetchTimestamps(videoUrl, ['en'])

    return timestamps.map(entry => ({
      text: entry.text,
      start: entry.start,
      duration: entry.duration
    }))
  } catch (error) {
    console.warn('[API] Error fetching timestamps:', error)
    return []
  }
}

/**
 * Fetch video captions as plain text
 */
export async function fetchVideoCaptions(videoId: string): Promise<string> {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    return await fetchCaptions(videoUrl, ['en'])
  } catch (error) {
    console.warn('[API] Error fetching captions:', error)
    return ''
  }
}
