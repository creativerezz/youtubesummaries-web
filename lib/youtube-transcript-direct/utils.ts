/**
 * Utilities for direct YouTube transcript extraction.
 * Adapted from @steipete/summarize-core.
 */

import { load } from "cheerio";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function sanitizeYoutubeJsonResponse(input: string): string {
  const trimmed = input.trimStart();
  if (trimmed.startsWith(")]}'")) {
    return trimmed.slice(4);
  }
  return trimmed;
}

export function decodeHtmlEntities(input: string): string {
  return input
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("&#x2F;", "/")
    .replaceAll("&nbsp;", " ");
}

function extractBalancedJsonObject(source: string, startAt: number): string | null {
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
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }
  return null;
}

const YTCFG_SET_TOKEN = "ytcfg.set";
const YTCFG_VAR_TOKEN = "var ytcfg";

function parseBootstrapFromScript(source: string): Record<string, unknown> | null {
  const sanitizedSource = sanitizeYoutubeJsonResponse(source.trimStart());

  for (let index = 0; index >= 0; ) {
    index = sanitizedSource.indexOf(YTCFG_SET_TOKEN, index);
    if (index < 0) break;

    const object = extractBalancedJsonObject(sanitizedSource, index);
    if (object) {
      try {
        const parsed: unknown = JSON.parse(object);
        if (isRecord(parsed)) return parsed;
      } catch {
        // keep searching
      }
    }
    index += YTCFG_SET_TOKEN.length;
  }

  const varIndex = sanitizedSource.indexOf(YTCFG_VAR_TOKEN);
  if (varIndex >= 0) {
    const object = extractBalancedJsonObject(sanitizedSource, varIndex);
    if (object) {
      try {
        const parsed: unknown = JSON.parse(object);
        if (isRecord(parsed)) return parsed;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function extractYoutubeBootstrapConfig(html: string): Record<string, unknown> | null {
  try {
    const $ = load(html);
    const scripts = $("script").toArray();

    for (const script of scripts) {
      const source = $(script).html();
      if (!source) continue;

      const config = parseBootstrapFromScript(source);
      if (config) return config;
    }
  } catch {
    // fall through to legacy regex
  }
  return parseBootstrapFromScript(html);
}

const FETCH_TIMEOUT_MS = 30_000;

export async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    Number.isFinite(timeoutMs) ? timeoutMs : FETCH_TIMEOUT_MS
  );
  try {
    return await fetchImpl(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export function extractYouTubeVideoId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase();
    let candidate: string | null = null;

    if (hostname === "youtu.be") {
      candidate = url.pathname.split("/")[1] ?? null;
    }
    if (hostname.includes("youtube.com")) {
      if (url.pathname.startsWith("/watch")) {
        candidate = url.searchParams.get("v");
      } else if (url.pathname.startsWith("/shorts/")) {
        candidate = url.pathname.split("/")[2] ?? null;
      } else if (url.pathname.startsWith("/embed/")) {
        candidate = url.pathname.split("/")[2] ?? null;
      } else if (url.pathname.startsWith("/v/")) {
        candidate = url.pathname.split("/")[2] ?? null;
      }
    }

    const trimmed = candidate?.trim() ?? "";
    if (!trimmed) return null;
    return /^[a-zA-Z0-9_-]{11}$/.test(trimmed) ? trimmed : null;
  } catch {
    return null;
  }
}
