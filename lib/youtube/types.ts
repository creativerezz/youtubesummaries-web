// YouTube transcript types

export interface TranscriptSegment {
  text: string
  start: number
  duration: number
}

export interface TranscriptData {
  video_id: string
  language: string
  language_code: string
  is_generated: boolean
  transcript: TranscriptSegment[]
}

export interface CachedVideoData {
  transcript: TranscriptData
  summary: string
  timestamp: number
}

export interface ExampleVideo {
  id: number
  title: string
  thumbnail: string
  url: string
  transcript: string
}

export interface VideoMetadata {
  title: string
  author_name: string
  author_url: string
  thumbnail_url: string
}

// Channel types
export interface Channel {
  id: string
  name: string
  description: string
  thumbnail: string
}

export interface ChannelInfo {
  title: string
  description: string
  thumbnail: string
  subscriberCount: string
}

export interface ChannelVideo {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
  duration: string
}

// Search types
export interface SearchVideo {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
}
