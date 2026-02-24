/**
 * Supadata API client for transcript and metadata.
 * https://supadata.ai/documentation/get-transcript
 * https://docs.supadata.ai/api-reference/endpoint/metadata/metadata
 */

const SUPADATA_BASE = "https://api.supadata.ai/v1";

function normalizeVideoUrl(video: string): string {
  const trimmed = video.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/watch?v=${trimmed}`;
  }
  if (trimmed.startsWith("http")) {
    return trimmed;
  }
  return `https://www.youtube.com/watch?v=${trimmed}`;
}

export type SupadataTranscriptResult = {
  content: string | Array<{ text: string; offset: number; duration: number }>;
  lang: string;
  availableLangs: string[];
};

export type SupadataMetadataResult = {
  platform: string;
  type: string;
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  author?: {
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    verified?: boolean;
  };
  media?: {
    type: string;
    duration?: number;
    thumbnailUrl?: string;
  };
};

export async function fetchSupadataTranscript(
  apiKey: string,
  video: string,
  lang = "en",
  text = false
): Promise<SupadataTranscriptResult | null> {
  const url = normalizeVideoUrl(video);
  const params = new URLSearchParams({
    url,
    lang,
    text: String(text),
    mode: "native", // Prefer existing captions, avoid AI generation costs
  });
  const res = await fetch(`${SUPADATA_BASE}/transcript?${params}`, {
    headers: { "x-api-key": apiKey },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as SupadataTranscriptResult;
  if (res.status === 202 && "jobId" in data) {
    // Async job - not supported in sync flow; return null to fall through
    return null;
  }
  return data;
}

function extractVideoId(video: string): string | null {
  const trimmed = video.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed);
    const v = u.searchParams.get("v") ?? u.pathname.split("/").pop();
    return v && /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : null;
  } catch {
    return null;
  }
}

export async function fetchSupadataMetadata(
  apiKey: string,
  video: string
): Promise<{ title: string; author_name: string; author_url: string; thumbnail_url: string } | null> {
  const videoId = extractVideoId(video);
  if (!videoId) return null;
  // Use YouTube-specific endpoint for channel URL
  const res = await fetch(
    `${SUPADATA_BASE}/youtube/video?id=${encodeURIComponent(videoId)}`,
    { headers: { "x-api-key": apiKey } }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as SupadataVideoResult;
  const channelId = data.channel?.id;
  return {
    title: data.title ?? "",
    author_name: data.channel?.name ?? "",
    author_url: channelId
      ? `https://www.youtube.com/channel/${channelId}`
      : "",
    thumbnail_url: data.thumbnail ?? "",
  };
}

// Channel types for Supadata
export type SupadataChannelResult = {
  id: string;
  name: string;
  description?: string;
  subscriberCount?: number;
  videoCount?: number;
  viewCount?: number;
  thumbnail?: string;
  banner?: string;
};

export type SupadataChannelVideosResult = {
  videoIds: string[];
  shortIds?: string[];
  liveIds?: string[];
};

export type SupadataVideoResult = {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
  channel?: { id?: string; name?: string };
  thumbnail?: string;
  uploadDate?: string;
  viewCount?: number;
  likeCount?: number;
};

export async function fetchSupadataChannel(
  apiKey: string,
  channelId: string
): Promise<SupadataChannelResult | null> {
  const res = await fetch(
    `${SUPADATA_BASE}/youtube/channel?id=${encodeURIComponent(channelId)}`,
    { headers: { "x-api-key": apiKey } }
  );
  if (!res.ok) return null;
  return (await res.json()) as SupadataChannelResult;
}

export async function fetchSupadataChannelVideos(
  apiKey: string,
  channelId: string,
  limit = 20
): Promise<SupadataChannelVideosResult | null> {
  const res = await fetch(
    `${SUPADATA_BASE}/youtube/channel/videos?id=${encodeURIComponent(channelId)}&limit=${limit}`,
    { headers: { "x-api-key": apiKey } }
  );
  if (!res.ok) return null;
  return (await res.json()) as SupadataChannelVideosResult;
}

export async function fetchSupadataVideo(
  apiKey: string,
  videoId: string
): Promise<SupadataVideoResult | null> {
  const res = await fetch(
    `${SUPADATA_BASE}/youtube/video?id=${encodeURIComponent(videoId)}`,
    { headers: { "x-api-key": apiKey } }
  );
  if (!res.ok) return null;
  return (await res.json()) as SupadataVideoResult;
}

export type SupadataSearchResultItem = {
  type: string;
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  viewCount?: number;
  uploadDate?: string;
  channel?: { id?: string; name?: string; thumbnail?: string };
};

export type SupadataSearchResult = {
  query: string;
  results: SupadataSearchResultItem[];
  totalResults?: number;
  nextPageToken?: string;
};

export async function fetchSupadataSearch(
  apiKey: string,
  query: string,
  limit = 12
): Promise<SupadataSearchResult | null> {
  const res = await fetch(
    `${SUPADATA_BASE}/youtube/search?query=${encodeURIComponent(query)}&type=video&limit=${limit}`,
    { headers: { "x-api-key": apiKey } }
  );
  if (!res.ok) return null;
  return (await res.json()) as SupadataSearchResult;
}
