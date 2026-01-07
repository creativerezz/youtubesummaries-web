import { getPlainOpenAIClient, isOpenAIConfigured } from "@/lib/openai-client";
import { auth } from "@clerk/nextjs/server";
import {
  rateLimiters,
  checkRateLimit,
  rateLimitResponse,
  rateLimitHeaders,
} from "@/lib/rate-limit";

export const maxDuration = 30;

export async function POST(req: Request) {
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
  // 1. Require authentication for chat
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult.userId || null;
  } catch (authError) {
    // Clerk middleware not configured or not available
    const err = authError as Error;
    if (!err.message?.includes("clerkMiddleware")) {
      throw authError;
    }
    console.warn("Clerk auth not available");
  }
  
  if (!userId) {
    return new Response(
      JSON.stringify({
        error: "Authentication required",
        message: "Please sign in to use the chat feature.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Check rate limit
  const rateLimit = await checkRateLimit(rateLimiters.chat, userId);
  if (!rateLimit.success) {
    return rateLimitResponse(
      rateLimit,
      "Chat rate limit exceeded. Please wait before sending more messages."
    );
  }

  const { messages, transcript } = await req.json();

  // Use plain client (not PostHog-wrapped) to avoid responses API issues
  const client = getPlainOpenAIClient();

  // Build messages array for OpenAI chat completions API
  const systemMessage = {
    role: "system" as const,
    content: `You are a helpful assistant. You are answering questions about the following video transcript.

TRANSCRIPT:
${transcript ? transcript.substring(0, 20000) : "No transcript provided."}

Answer the user's questions based on the transcript provided. If the answer is not in the transcript, say so.`,
  };

  // Normalize incoming messages to ensure proper format
  const chatMessages = messages.map(
    (msg: { role: string; content: string }) => ({
      role: msg.role as "user" | "assistant",
      content: typeof msg.content === "string" ? msg.content : String(msg.content),
    })
  );

  try {
    const stream = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [systemMessage, ...chatMessages],
      stream: true,
    });

    // Convert to SSE format that the chat component expects
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              const data = JSON.stringify({ content });
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Error in chat stream:", error);
          const errorData = JSON.stringify({ error: "Failed to generate response" });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...rateLimitHeaders(rateLimit),
      },
    });
  } catch (error) {
    console.error("Error creating chat completion:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create chat completion" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
