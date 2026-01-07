import { NextRequest } from "next/server";
import { generateSummaryStreamWithAnalytics, isOpenAIConfigured } from "@/lib/openai-client";
import { auth } from "@clerk/nextjs/server";
import {
  rateLimiters,
  checkRateLimit,
  getIdentifier,
  rateLimitResponse,
  rateLimitHeaders,
} from "@/lib/rate-limit";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // Check if AI is configured
    if (!isOpenAIConfigured()) {
      return new Response(
        JSON.stringify({
          error: "AI service not configured",
          message: "The OPENROUTER_API_KEY is not set. Please configure it in your environment variables.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }
    // Check authentication (optional - affects rate limit tier)
    // Handle case where Clerk middleware might not be initialized
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId || null;
    } catch (authError) {
      // Clerk middleware not configured or not available
      // Continue without authentication (anonymous user)
      const err = authError as Error;
      if (!err.message?.includes("clerkMiddleware")) {
        // Re-throw if it's a different error
        throw authError;
      }
      console.warn("Clerk auth not available, proceeding as anonymous user");
    }
    const identifier = getIdentifier(request, userId);

    // Apply different rate limits based on auth status
    const limiter = userId
      ? rateLimiters.summarizeAuthenticated
      : rateLimiters.summarizeAnonymous;

    const rateLimit = await checkRateLimit(limiter, identifier);
    if (!rateLimit.success) {
      return rateLimitResponse(
        rateLimit,
        userId
          ? "Rate limit exceeded. Please wait before generating more summaries."
          : "Rate limit exceeded. Sign in for higher limits."
      );
    }

    const { transcript, videoId, userId: bodyUserId } = await request.json();

    if (!transcript) {
      return new Response(
        JSON.stringify({ error: "Transcript is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completionStream = await generateSummaryStreamWithAnalytics(
            transcript,
            {
              model: "openai/gpt-4o-mini",
              distinctId: bodyUserId || userId || "anonymous",
              traceId: `video_${videoId}`,
              properties: {
                video_id: videoId,
                source: "api_route",
                authenticated: !!userId,
              },
            }
          );

          // Stream the completion chunks
          for await (const chunk of completionStream) {
            if (request.signal.aborted) {
              // Client disconnected, stop streaming
              return;
            }

            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              // Format as Server-Sent Events
              const data = JSON.stringify({ content });
              try {
                controller.enqueue(
                  new TextEncoder().encode(`data: ${data}\n\n`)
                );
              } catch {
                // Controller might be closed, just stop
                return;
              }
            }
          }

          // Send done signal
          try {
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            controller.close();
          } catch {
            // Ignore errors if controller is already closed
          }
        } catch (error) {
          console.error("Error in stream:", error);
          // Only try to send error if controller is still open and not aborted
          if (!request.signal.aborted) {
            try {
              const errorData = JSON.stringify({
                error: "Failed to generate summary",
              });
              controller.enqueue(
                new TextEncoder().encode(`data: ${errorData}\n\n`)
              );
              controller.close();
            } catch {
              // Ignore
            }
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...rateLimitHeaders(rateLimit),
      },
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate summary" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
