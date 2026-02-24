/**
 * YouTube captionTracks extraction.
 * Adapted from @steipete/summarize-core.
 */

import type { TranscriptSegment } from "./types";
import {
  decodeHtmlEntities,
  fetchWithTimeout,
  isRecord,
  sanitizeYoutubeJsonResponse,
} from "./utils";
import { extractYoutubeiBootstrap } from "./api";

const REQUEST_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

const YT_INITIAL_PLAYER_RESPONSE_TOKEN = "ytInitialPlayerResponse";

type TranscriptPayload = {
  text: string;
  segments: TranscriptSegment[] | null;
};

type CaptionsPayload = Record<string, unknown> & {
  captions?: unknown;
  playerCaptionsTracklistRenderer?: unknown;
};

type CaptionListRenderer = Record<string, unknown> & {
  captionTracks?: unknown;
  automaticCaptions?: unknown;
};

type CaptionTrackRecord = Record<string, unknown> & {
  languageCode?: unknown;
  kind?: unknown;
  baseUrl?: unknown;
  url?: unknown;
};

type CaptionEventRecord = Record<string, unknown> & {
  segs?: unknown;
  tStartMs?: unknown;
  dDurationMs?: unknown;
};

type CaptionSegmentRecord = Record<string, unknown> & { utf8?: unknown };

function extractBalancedJsonObject(
  source: string,
  startAt: number
): string | null {
  const start = source.indexOf("{", startAt);
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let quote: '"' | "'" | null = null;
  let escaping = false;

  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (!ch) continue;

    if (inString) {
      if (escaping) {
        escaping = false;
        continue;
      }
      if (ch === "\\") {
        escaping = true;
        continue;
      }
      if (quote && ch === quote) {
        inString = false;
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }

    if (ch === "{") {
      depth += 1;
      continue;
    }
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

function extractInitialPlayerResponse(
  html: string
): Record<string, unknown> | null {
  const tokenIndex = html.indexOf(YT_INITIAL_PLAYER_RESPONSE_TOKEN);
  if (tokenIndex < 0) return null;
  const assignmentIndex = html.indexOf("=", tokenIndex);
  if (assignmentIndex < 0) return null;
  const objectText = extractBalancedJsonObject(html, assignmentIndex);
  if (!objectText) return null;
  try {
    const parsed: unknown = JSON.parse(objectText);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function parseTimestampToMs(value: unknown, assumeSeconds = false): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) return null;
    return assumeSeconds ? Math.round(value * 1000) : Math.round(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric) && numeric >= 0) {
      return assumeSeconds ? Math.round(numeric * 1000) : Math.round(numeric);
    }
  }
  return null;
}

const INNERTUBE_API_KEY_REGEX =
  /"INNERTUBE_API_KEY":"([^"]+)"|INNERTUBE_API_KEY\\":\\"([^\\"]+)\\"/;

function extractInnertubeApiKey(html: string): string | null {
  const match = html.match(INNERTUBE_API_KEY_REGEX);
  const key = match?.[1] ?? match?.[2] ?? null;
  return typeof key === "string" && key.trim().length > 0 ? key.trim() : null;
}

type YoutubePlayerContext = Record<string, unknown> & { client?: unknown };

async function fetchTranscriptViaAndroidPlayer(
  fetchImpl: typeof fetch,
  html: string,
  videoId: string
): Promise<TranscriptPayload | null> {
  const apiKey = extractInnertubeApiKey(html);
  if (!apiKey) return null;

  try {
    const response = await fetchWithTimeout(
      fetchImpl,
      `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": REQUEST_HEADERS["User-Agent"] ?? "",
          "Accept-Language": REQUEST_HEADERS["Accept-Language"] ?? "en-US,en;q=0.9",
          Accept: "application/json",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "ANDROID",
              clientVersion: "20.10.38",
            },
          },
          videoId,
        }),
      }
    );

    if (!response.ok) return null;
    const parsed: unknown = await response.json();
    if (!isRecord(parsed)) return null;
    return extractTranscriptFromPlayerPayload(fetchImpl, parsed);
  } catch {
    return null;
  }
}

async function extractTranscriptFromPlayerPayload(
  fetchImpl: typeof fetch,
  payload: Record<string, unknown>
): Promise<TranscriptPayload | null> {
  const payloadRecord = payload as CaptionsPayload;
  const captionsCandidate = payloadRecord.captions;
  const captions = isRecord(captionsCandidate)
    ? (captionsCandidate as CaptionsPayload)
    : null;

  const rendererCandidate =
    (captions?.playerCaptionsTracklistRenderer as Record<string, unknown>) ??
    payloadRecord.playerCaptionsTracklistRenderer;

  const renderer = isRecord(rendererCandidate)
    ? (rendererCandidate as CaptionListRenderer)
    : null;

  const captionTracks = Array.isArray(renderer?.captionTracks)
    ? (renderer?.captionTracks as unknown[])
    : null;
  const automaticTracks = Array.isArray(renderer?.automaticCaptions)
    ? (renderer?.automaticCaptions as unknown[])
    : null;

  const orderedTracks: Record<string, unknown>[] = [];
  if (captionTracks) {
    orderedTracks.push(
      ...captionTracks.filter((t): t is Record<string, unknown> => isRecord(t))
    );
  }
  if (automaticTracks) {
    orderedTracks.push(
      ...automaticTracks.filter((t): t is Record<string, unknown> => isRecord(t))
    );
  }

  const sortedTracks = [...orderedTracks].sort((a, b) => {
    const aTrack = a as CaptionTrackRecord;
    const bTrack = b as CaptionTrackRecord;
    const aKind = typeof aTrack.kind === "string" ? aTrack.kind : "";
    const bKind = typeof bTrack.kind === "string" ? bTrack.kind : "";
    if (aKind === "asr" && bKind !== "asr") return 1;
    if (bKind === "asr" && aKind !== "asr") return -1;
    const aLang = typeof aTrack.languageCode === "string" ? aTrack.languageCode : "";
    const bLang = typeof bTrack.languageCode === "string" ? bTrack.languageCode : "";
    const aIsEnglish = aLang === "en" || aLang.startsWith("en-");
    const bIsEnglish = bLang === "en" || bLang.startsWith("en-");
    if (aIsEnglish && !bIsEnglish) return -1;
    if (bIsEnglish && !aIsEnglish) return 1;
    return 0;
  });

  const seenLanguages = new Set<string>();
  const normalizedTracks: Record<string, unknown>[] = [];
  for (const candidate of sortedTracks) {
    const trackRecord = candidate as CaptionTrackRecord;
    const lang =
      typeof trackRecord.languageCode === "string"
        ? trackRecord.languageCode.toLowerCase()
        : "";
    if (lang && seenLanguages.has(lang)) continue;
    if (lang) seenLanguages.add(lang);
    normalizedTracks.push(candidate);
  }

  if (normalizedTracks.length === 0) return null;
  return findFirstTranscript(fetchImpl, normalizedTracks, 0);
}

async function findFirstTranscript(
  fetchImpl: typeof fetch,
  tracks: readonly Record<string, unknown>[],
  index: number
): Promise<TranscriptPayload | null> {
  if (index >= tracks.length) return null;
  const candidate = await downloadCaptionTrack(fetchImpl, tracks[index] ?? {});
  if (candidate) return candidate;
  return findFirstTranscript(fetchImpl, tracks, index + 1);
}

async function downloadCaptionTrack(
  fetchImpl: typeof fetch,
  track: Record<string, unknown>
): Promise<TranscriptPayload | null> {
  const trackRecord = track as CaptionTrackRecord;
  const baseUrl =
    typeof trackRecord.baseUrl === "string"
      ? trackRecord.baseUrl
      : typeof trackRecord.url === "string"
        ? trackRecord.url
        : null;
  if (!baseUrl) return null;

  const json3Url = (() => {
    try {
      const parsed = new URL(baseUrl);
      parsed.searchParams.set("fmt", "json3");
      parsed.searchParams.set("alt", "json");
      return parsed.toString();
    } catch {
      const sep = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${sep}fmt=json3&alt=json`;
    }
  })();

  try {
    const response = await fetchWithTimeout(fetchImpl, json3Url, {
      headers: REQUEST_HEADERS,
    });
    if (!response.ok) return await downloadXmlTranscript(fetchImpl, baseUrl);

    const text = await response.text();
    if (text.length === 0) return await downloadXmlTranscript(fetchImpl, baseUrl);

    const jsonResult = parseJsonTranscript(text);
    if (jsonResult) return jsonResult;
    const xmlFallback = parseXmlTranscript(text);
    if (xmlFallback) return xmlFallback;
    return await downloadXmlTranscript(fetchImpl, baseUrl);
  } catch {
    return await downloadXmlTranscript(fetchImpl, baseUrl);
  }
}

async function downloadXmlTranscript(
  fetchImpl: typeof fetch,
  baseUrl: string
): Promise<TranscriptPayload | null> {
  const xmlUrl = baseUrl.replaceAll(/&fmt=[^&]+/g, "");
  try {
    const response = await fetchWithTimeout(fetchImpl, xmlUrl, {
      headers: REQUEST_HEADERS,
    });
    if (!response.ok) return null;
    const text = await response.text();
    const jsonResult = parseJsonTranscript(text);
    if (jsonResult) return jsonResult;
    return parseXmlTranscript(text);
  } catch {
    return null;
  }
}

type CaptionPayload = { events?: unknown };

function parseJsonTranscript(raw: string): TranscriptPayload | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const payloadRecord = parsed as CaptionPayload;
    const events = payloadRecord.events;
    if (!Array.isArray(events)) return null;

    const lines: string[] = [];
    const segments: TranscriptSegment[] = [];

    for (const event of events) {
      if (!isRecord(event)) continue;
      const eventRecord = event as CaptionEventRecord;
      const segs = Array.isArray(eventRecord.segs) ? eventRecord.segs : null;
      if (!segs) continue;

      const text = segs
        .map((seg) => {
          if (!isRecord(seg)) return "";
          const segRecord = seg as CaptionSegmentRecord;
          return typeof segRecord.utf8 === "string" ? segRecord.utf8 : "";
        })
        .join("")
        .trim();

      if (text.length > 0) {
        lines.push(text);
        const startMs = parseTimestampToMs(eventRecord.tStartMs, false);
        const durationMs = parseTimestampToMs(eventRecord.dDurationMs, false);
        if (startMs != null) {
          segments.push({
            startMs,
            endMs: durationMs != null ? startMs + durationMs : null,
            text: text.replace(/\s+/g, " ").trim(),
          });
        }
      }
    }

    const transcript = lines.join("\n").trim();
    if (transcript.length === 0) return null;

    return {
      text: transcript,
      segments: segments.length > 0 ? segments : null,
    };
  } catch {
    return null;
  }
}

function parseXmlTranscript(xml: string): TranscriptPayload | null {
  const pattern = /<text[^>]*>([\s\S]*?)<\/text>/gi;
  const lines: string[] = [];
  const segments: TranscriptSegment[] = [];
  let match = pattern.exec(xml);

  while (match) {
    const content = match[1] ?? "";
    const decoded = decodeHtmlEntities(content).replaceAll(/\s+/g, " ").trim();
    if (decoded.length > 0) {
      lines.push(decoded);
      const tag = match[0] ?? "";
      const startMatch = tag.match(/\bstart\s*=\s*(['"])([^'"]+)\1/i);
      const durMatch = tag.match(/\bdur\s*=\s*(['"])([^'"]+)\1/i);
      const startMs = startMatch?.[2]
        ? parseTimestampToMs(startMatch[2], true)
        : null;
      const durationMs = durMatch?.[2]
        ? parseTimestampToMs(durMatch[2], true)
        : null;
      if (startMs != null) {
        segments.push({
          startMs,
          endMs: durationMs != null ? startMs + durationMs : null,
          text: decoded.replace(/\s+/g, " ").trim(),
        });
      }
    }
    match = pattern.exec(xml);
  }

  const transcript = lines.join("\n").trim();
  if (transcript.length === 0) return null;

  return {
    text: transcript,
    segments: segments.length > 0 ? segments : null,
  };
}

export async function fetchTranscriptFromCaptionTracks(
  fetchImpl: typeof fetch,
  html: string,
  originalUrl: string,
  videoId: string
): Promise<TranscriptPayload | null> {
  const initialPlayerResponse = extractInitialPlayerResponse(html);
  if (initialPlayerResponse) {
    const transcript = await extractTranscriptFromPlayerPayload(
      fetchImpl,
      initialPlayerResponse
    );
    if (transcript) return transcript;
  }

  const bootstrap = extractYoutubeiBootstrap(html);
  if (!bootstrap) {
    return fetchTranscriptViaAndroidPlayer(fetchImpl, html, videoId);
  }

  const { apiKey, clientName, clientVersion, context, pageCl, pageLabel, visitorData, xsrfToken } =
    bootstrap;
  if (!apiKey) {
    return fetchTranscriptViaAndroidPlayer(fetchImpl, html, videoId);
  }

  const contextRecord = context as YoutubePlayerContext;
  const clientContext = isRecord(contextRecord.client)
    ? (contextRecord.client as Record<string, unknown>)
    : {};

  const requestBody: Record<string, unknown> = {
    context: {
      ...contextRecord,
      client: { ...clientContext, originalUrl },
    },
    videoId,
    playbackContext: {
      contentPlaybackContext: { html5Preference: "HTML5_PREF_WANTS" },
    },
    contentCheckOk: true,
    racyCheckOk: true,
  };

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": REQUEST_HEADERS["User-Agent"] ?? "",
      Accept: "application/json",
      Origin: "https://www.youtube.com",
      Referer: originalUrl,
      "X-Goog-AuthUser": "0",
      "X-Youtube-Bootstrap-Logged-In": "false",
    };
    if (clientName) headers["X-Youtube-Client-Name"] = clientName;
    if (clientVersion) headers["X-Youtube-Client-Version"] = clientVersion;
    if (visitorData) headers["X-Goog-Visitor-Id"] = visitorData;
    if (typeof pageCl === "number" && Number.isFinite(pageCl)) {
      headers["X-Youtube-Page-CL"] = String(pageCl);
    }
    if (pageLabel) headers["X-Youtube-Page-Label"] = pageLabel;
    if (xsrfToken) headers["X-Youtube-Identity-Token"] = xsrfToken;

    const response = await fetchWithTimeout(
      fetchImpl,
      `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`,
      { method: "POST", headers, body: JSON.stringify(requestBody) }
    );

    if (!response.ok) {
      return fetchTranscriptViaAndroidPlayer(fetchImpl, html, videoId);
    }

    const raw = await response.text();
    const sanitized = sanitizeYoutubeJsonResponse(raw);
    const parsed: unknown = JSON.parse(sanitized);
    if (!isRecord(parsed)) {
      return fetchTranscriptViaAndroidPlayer(fetchImpl, html, videoId);
    }

    const transcript = await extractTranscriptFromPlayerPayload(
      fetchImpl,
      parsed
    );
    if (transcript) return transcript;

    return fetchTranscriptViaAndroidPlayer(fetchImpl, html, videoId);
  } catch {
    return fetchTranscriptViaAndroidPlayer(fetchImpl, html, videoId);
  }
}
