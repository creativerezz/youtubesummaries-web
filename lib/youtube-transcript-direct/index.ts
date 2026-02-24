/**
 * Direct YouTube transcript extraction (youtubei + captionTracks).
 * Adapted from @steipete/summarize-core.
 *
 * Fallback when Supadata and Cloudflare Worker are unavailable.
 * Uses YouTube's internal APIs - no external transcript service required.
 */

import type { DirectTranscriptResult } from "./types";
import { extractYouTubeVideoId, fetchWithTimeout } from "./utils";
import {
  extractYoutubeiTranscriptConfig,
  fetchTranscriptFromTranscriptEndpoint,
} from "./api";
import { fetchTranscriptFromCaptionTracks } from "./captions";
import { extractVideoMetadataFromHtml } from "./metadata";

const WATCH_PAGE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
};

function segmentsToTimestamps(
  segments: Array<{ startMs: number; endMs?: number | null; text: string }>
): Array<{ text: string; start: number; duration: number }> {
  return segments.map((seg) => ({
    text: seg.text,
    start: Math.floor(seg.startMs / 1000),
    duration: seg.endMs != null
      ? Math.floor((seg.endMs - seg.startMs) / 1000)
      : 3,
  }));
}

/**
 * Fetch YouTube transcript directly from YouTube's APIs.
 * Tries youtubei first, then captionTracks.
 *
 * @param video - YouTube URL or video ID
 * @returns Transcript with captions, timestamps, and optional metadata, or null
 */
export async function fetchTranscriptDirect(
  video: string
): Promise<DirectTranscriptResult | null> {
  const videoId = extractYouTubeVideoId(video);
  if (!videoId) return null;

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // 1. Fetch watch page HTML
  let html: string;
  try {
    const response = await fetchWithTimeout(
      fetch,
      watchUrl,
      { headers: WATCH_PAGE_HEADERS },
      15_000
    );
    if (!response.ok) return null;
    html = await response.text();
  } catch {
    return null;
  }

  const hasBootstrap =
    typeof html === "string" && /ytcfg\.set|ytInitialPlayerResponse/.test(html);
  if (!hasBootstrap) return null;

  const metadata = extractVideoMetadataFromHtml(html);

  // 2. Try youtubei get_transcript
  const config = extractYoutubeiTranscriptConfig(html);
  if (config) {
    const transcript = await fetchTranscriptFromTranscriptEndpoint(
      fetch,
      config,
      watchUrl
    );
    if (transcript?.text) {
      return {
        captions: transcript.text,
        timestamps: transcript.segments
          ? segmentsToTimestamps(transcript.segments)
          : [],
        metadata: metadata ?? undefined,
        source: "youtubei",
      };
    }
  }

  // 3. Try captionTracks
  const captionTranscript = await fetchTranscriptFromCaptionTracks(
    fetch,
    html,
    watchUrl,
    videoId
  );
  if (captionTranscript?.text) {
    return {
      captions: captionTranscript.text,
      timestamps: captionTranscript.segments
        ? segmentsToTimestamps(captionTranscript.segments)
        : [],
      metadata: metadata ?? undefined,
      source: "captionTracks",
    };
  }

  return null;
}
