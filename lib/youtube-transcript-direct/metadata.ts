/**
 * Extract video metadata from ytInitialPlayerResponse.
 */

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
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

export type VideoMetadata = {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
};

export function extractVideoMetadataFromHtml(html: string): VideoMetadata | null {
  const tokenIndex = html.indexOf("ytInitialPlayerResponse");
  if (tokenIndex < 0) return null;
  const assignmentIndex = html.indexOf("=", tokenIndex);
  if (assignmentIndex < 0) return null;
  const objectText = extractBalancedJsonObject(html, assignmentIndex);
  if (!objectText) return null;

  try {
    const parsed = JSON.parse(objectText) as Record<string, unknown>;
    const videoDetails = parsed?.videoDetails;
    if (!videoDetails || typeof videoDetails !== "object") return null;

    const vd = videoDetails as Record<string, unknown>;
    const title = typeof vd.title === "string" ? vd.title : undefined;
    const author = typeof vd.author === "string" ? vd.author : undefined;
    const channelId = typeof vd.channelId === "string" ? vd.channelId : undefined;

    const thumbObj = vd.thumbnail;
    const thumbnails =
      thumbObj &&
      typeof thumbObj === "object" &&
      "thumbnails" in thumbObj &&
      Array.isArray((thumbObj as { thumbnails?: unknown }).thumbnails)
        ? ((thumbObj as { thumbnails: Array<{ url?: string }> }).thumbnails)
        : null;
    const thumbnail = thumbnails?.[0]?.url;

    return {
      title,
      author_name: author,
      author_url: channelId
        ? `https://www.youtube.com/channel/${channelId}`
        : undefined,
      thumbnail_url: thumbnail,
    };
  } catch {
    return null;
  }
}
