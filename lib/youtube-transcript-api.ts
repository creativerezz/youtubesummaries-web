/**
 * YouTube Transcript API Client
 *
 * This client uses a local proxy endpoint to fetch transcripts from FastAPI.
 * The proxy at /api/v1/transcript bypasses CORS issues when running locally.
 *
 * For production, requests go through the Next.js API route which calls:
 * https://api1.youtubesummaries.cc/
 */

// Use local proxy to avoid CORS issues
const TRANSCRIPT_API_BASE_URL = '/api/v1/transcript';

export interface CaptionsResponse {
  captions: string;
}

export interface VideoDataResponse {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
}

export interface TimestampEntry {
  text: string;
  start: number;
  duration: number;
}

export interface TimestampsResponse {
  timestamps: TimestampEntry[];
}

export interface LanguageInfo {
  code: string;
  name: string;
}

export interface LanguagesResponse {
  languages: LanguageInfo[];
}

/**
 * Extract video ID from YouTube URL or return the ID if already provided
 */
export function extractVideoId(video: string): string | null {
  // If it's already a video ID (11 characters, alphanumeric)
  if (/^[a-zA-Z0-9_-]{11}$/.test(video)) {
    return video;
  }

  // Try to extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = video.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fetch video captions/transcript as plain text
 *
 * @param url - YouTube URL or video ID
 * @param languages - Array of language codes (default: ['en'])
 * @returns Captions as plain text string
 */
export async function fetchCaptions(
  url: string,
  languages: string[] = ['en']
): Promise<string> {
  const videoParam = encodeURIComponent(url);
  const languagesParam = languages.join(',');
  const response = await fetch(
    `${TRANSCRIPT_API_BASE_URL}?video=${videoParam}&languages=${languagesParam}&format=captions`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || error.error || `Failed to fetch captions: ${response.status}`);
  }

  // Proxy returns plain text for captions
  return await response.text();
}

/**
 * Fetch video metadata (title, author, thumbnail)
 *
 * @param url - YouTube URL or video ID
 */
export async function fetchVideoData(url: string): Promise<VideoDataResponse> {
  const videoParam = encodeURIComponent(url);
  const response = await fetch(
    `${TRANSCRIPT_API_BASE_URL}?video=${videoParam}&format=metadata`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || error.error || `Failed to fetch video data: ${response.status}`);
  }

  const data = await response.json();
  // Map FastAPI response format to expected format
  return {
    title: data.title,
    author_name: data.author_name,
    author_url: data.author_url,
    thumbnail_url: data.thumbnail_url,
  };
}

/**
 * Fetch video transcript with timestamps
 *
 * @param url - YouTube URL or video ID
 * @param languages - Array of language codes (default: ['en'])
 */
export async function fetchTimestamps(
  url: string,
  languages: string[] = ['en']
): Promise<TimestampEntry[]> {
  const videoParam = encodeURIComponent(url);
  const languagesParam = languages.join(',');
  const response = await fetch(
    `${TRANSCRIPT_API_BASE_URL}?video=${videoParam}&languages=${languagesParam}&format=timestamps`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || error.error || `Failed to fetch timestamps: ${response.status}`);
  }

  // FastAPI returns array of strings like "0:00 - text", need to parse
  const timestampStrings: string[] = await response.json();
  
  // Parse timestamp strings into TimestampEntry format
  // Format: "0:00 - text" or "1:23 - text"
  const timestamps: TimestampEntry[] = [];
  
  for (let i = 0; i < timestampStrings.length; i++) {
    const timestampStr = timestampStrings[i];
    const match = timestampStr.match(/^(\d+):(\d+)\s*-\s*(.+)$/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const text = match[3] || '';
      const start = minutes * 60 + seconds;
      
      // Calculate duration based on next timestamp or default
      let duration = 3; // Default duration
      if (i < timestampStrings.length - 1) {
        const nextMatch = timestampStrings[i + 1].match(/^(\d+):(\d+)/);
        if (nextMatch) {
          const nextMinutes = parseInt(nextMatch[1], 10);
          const nextSeconds = parseInt(nextMatch[2], 10);
          const nextStart = nextMinutes * 60 + nextSeconds;
          duration = Math.max(1, nextStart - start); // At least 1 second
        }
      }
      
      timestamps.push({
        text,
        start,
        duration,
      });
    }
  }
  
  return timestamps;
}

/**
 * Get available transcript languages for a video
 * 
 * Note: FastAPI doesn't currently expose a languages endpoint.
 * This function returns an empty array for now.
 *
 * @param url - YouTube URL or video ID
 */
export async function fetchAvailableLanguages(url: string): Promise<LanguageInfo[]> {
  // FastAPI doesn't have a languages endpoint yet
  // Return empty array or common languages as fallback
  return [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ];
}

/**
 * Fetch complete transcript data (metadata + captions)
 * Combines video-data and video-captions endpoints
 *
 * @param url - YouTube URL or video ID
 * @param languages - Array of language codes (default: ['en'])
 */
export async function fetchTranscript(
  url: string,
  languages: string[] = ['en']
) {
  const [videoData, captions] = await Promise.all([
    fetchVideoData(url),
    fetchCaptions(url, languages),
  ]);

  return {
    ...videoData,
    captions,
    video_id: extractVideoId(url),
  };
}

// Legacy exports for backwards compatibility
export { fetchCaptions as getTranscript };
export type { CaptionsResponse as TranscriptResponse };
