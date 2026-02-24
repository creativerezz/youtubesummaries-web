import { NextRequest, NextResponse } from "next/server";
import {
  fetchSupadataMetadata,
  fetchSupadataTranscript,
} from "@/lib/supadata";
import { fetchTranscriptDirect } from "@/lib/youtube-transcript-direct";

const SUPADATA_API_KEY = process.env.SUPADATA_API_KEY;
const TRANSCRIPT_WORKER_URL =
  process.env.TRANSCRIPT_WORKER_URL ||
  "https://youtube-transcript-storage.automatehub.workers.dev";

export const maxDuration = 30;

/**
 * Proxy endpoint for fetching YouTube transcripts and metadata
 *
 * Fallback chain:
 * 1. Supadata (api.supadata.ai) when SUPADATA_API_KEY is set
 * 2. Cloudflare Worker (youtube-transcript-storage)
 * 3. Direct extraction (youtubei + captionTracks from YouTube's internal APIs)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const video = searchParams.get("video");
  const languages = searchParams.get("languages") || "en";
  const format = searchParams.get("format") || "timestamps";
  const lang = languages.split(",")[0] ?? "en";

  if (!video) {
    return NextResponse.json(
      { error: "Missing video parameter" },
      { status: 400 }
    );
  }

  const languagesArr = languages.split(",");

  // 1. Try Supadata first (when API key is set)
  if (SUPADATA_API_KEY) {
    try {
      if (format === "metadata") {
        const meta = await fetchSupadataMetadata(SUPADATA_API_KEY, video);
        if (meta) {
          return NextResponse.json(meta);
        }
      } else {
        const transcript = await fetchSupadataTranscript(
          SUPADATA_API_KEY,
          video,
          lang,
          format === "captions"
        );
        if (transcript) {
          const content = transcript.content;
          if (format === "captions") {
            const text =
              typeof content === "string" ? content : content.map((c) => c.text).join("\n");
            return new NextResponse(text, {
              headers: { "Content-Type": "text/plain" },
            });
          }
          // timestamps: Supadata returns { text, offset, duration } in ms
          if (Array.isArray(content)) {
            const timestampStrings = content.map((c) => {
              const startSec = Math.floor(c.offset / 1000);
              const m = Math.floor(startSec / 60);
              const s = startSec % 60;
              return `${m}:${s.toString().padStart(2, "0")} - ${c.text}`;
            });
            return NextResponse.json(timestampStrings);
          }
          // Plain string fallback
          if (typeof content === "string" && content) {
            return NextResponse.json([`0:00 - ${content}`]);
          }
        }
      }
    } catch {
      // Supadata failed; try Worker then direct
    }
  }

  // 2. Fallback: Cloudflare Worker
  try {
    const workerResponse = await fetch(`${TRANSCRIPT_WORKER_URL}/fetch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video, languages: languagesArr }),
    });

    if (!workerResponse.ok) {
      if (workerResponse.status >= 500) {
        const err = await workerResponse.json().catch(() => ({}));
        if (err?.error) {
          console.warn("[Transcript Proxy] Worker error, trying direct:", err.error);
        }
      } else {
        const err = await workerResponse.json().catch(() => ({ error: "Unknown error" }));
        return NextResponse.json(
          { error: err.error || "Failed to fetch transcript from Worker" },
          { status: workerResponse.status }
        );
      }
    } else {
      const result = await workerResponse.json();
      const data = result.data;

      if (data) {
        if (format === "metadata") {
          return NextResponse.json({
            title: data.title || "",
            author_name: data.author_name || "",
            author_url: data.author_url || "",
            thumbnail_url: data.thumbnail_url || "",
          });
        }
        if (format === "captions") {
          return new NextResponse(data.captions || "", {
            headers: { "Content-Type": "text/plain" },
          });
        }
        return NextResponse.json(data.timestamps || []);
      }
    }
  } catch {
    // Worker unreachable; try direct extraction
  }

  // 3. Fallback: Direct extraction (youtubei + captionTracks)
  try {
    const directResult = await fetchTranscriptDirect(video);
    if (directResult) {
      if (format === "metadata") {
        return NextResponse.json({
          title: directResult.metadata?.title ?? "",
          author_name: directResult.metadata?.author_name ?? "",
          author_url: directResult.metadata?.author_url ?? "",
          thumbnail_url: directResult.metadata?.thumbnail_url ?? "",
        });
      }
      if (format === "captions") {
        return new NextResponse(directResult.captions, {
          headers: { "Content-Type": "text/plain" },
        });
      }
      const timestampStrings = directResult.timestamps.map((t) => {
        const m = Math.floor(t.start / 60);
        const s = t.start % 60;
        return `${m}:${s.toString().padStart(2, "0")} - ${t.text}`;
      });
      return NextResponse.json(timestampStrings);
    }
  } catch {
    console.warn("[Transcript Proxy] All sources failed");
  }

  return NextResponse.json(
    { error: "Failed to fetch transcript" },
    { status: 500 }
  );
}
