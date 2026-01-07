import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "https://api1.youtubesummaries.cc";

export const maxDuration = 30;

/**
 * Proxy endpoint for fetching YouTube transcripts and metadata
 * This bypasses CORS issues when calling FastAPI from the browser
 *
 * FastAPI endpoints use POST with JSON body:
 * - /youtube/video-timestamps: { video, languages } -> { timestamps: [...] }
 * - /youtube/video-captions: { video, languages } -> { captions: "..." }
 * - /youtube/video-data: { video } -> { title, author_name, author_url, thumbnail_url }
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const video = searchParams.get("video");
  const languages = searchParams.get("languages") || "en";
  const format = searchParams.get("format") || "timestamps"; // timestamps, captions, or metadata

  if (!video) {
    return NextResponse.json(
      { error: "Missing video parameter" },
      { status: 400 }
    );
  }

  try {
    let endpoint: string;
    let body: Record<string, unknown>;

    if (format === "metadata") {
      endpoint = "/youtube/video-data";
      body = { video: video };
    } else if (format === "captions") {
      endpoint = "/youtube/video-captions";
      body = { video: video, languages: languages.split(",") };
    } else {
      endpoint = "/youtube/video-timestamps";
      body = { video: video, languages: languages.split(",") };
    }

    const url = `${FASTAPI_URL}${endpoint}`;

    // FastAPI expects POST with JSON body
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Transcript Proxy] FastAPI error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to fetch ${format}: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // For captions, return as text (API returns plain text)
    if (format === "captions") {
      // The API returns captions as a string in the response
      const captionsText = typeof data === 'string' ? data : data.captions || "";
      return new NextResponse(captionsText, {
        headers: { "Content-Type": "text/plain" },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Transcript Proxy] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transcript" },
      { status: 500 }
    );
  }
}
