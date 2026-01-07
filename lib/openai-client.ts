import { OpenAI as PostHogOpenAI } from '@posthog/ai/openai'
import OpenAI from 'openai'
import { getPostHogClient } from '@/lib/posthog-server'

let openaiClient: OpenAI | null = null
let plainOpenaiClient: OpenAI | null = null

/**
 * Check if OpenRouter API key is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY
}

export function getOpenAIClient(): OpenAI {
  if (openaiClient) {
    return openaiClient
  }

  const openrouterApiKey = process.env.OPENROUTER_API_KEY
  const posthogClient = getPostHogClient()

  if (!openrouterApiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('OPENROUTER_API_KEY not set. AI features will be disabled.')
    }
    throw new Error('OPENROUTER_API_KEY is not configured. Please add it to your .env.local file.')
  }

  // Initialize OpenAI client with PostHog monitoring if available
  // Otherwise use standard OpenAI client
  if (posthogClient) {
    openaiClient = new PostHogOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: openrouterApiKey,
      posthog: posthogClient,
    }) as unknown as OpenAI
  } else {
    openaiClient = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: openrouterApiKey,
    })
  }

  return openaiClient
}

// Get a plain OpenAI client without PostHog wrapping
// Use this for chat completions to avoid responses API issues
export function getPlainOpenAIClient(): OpenAI {
  if (plainOpenaiClient) {
    return plainOpenaiClient
  }

  const openrouterApiKey = process.env.OPENROUTER_API_KEY

  if (!openrouterApiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('OPENROUTER_API_KEY not set. AI features will be disabled.')
    }
    throw new Error('OPENROUTER_API_KEY is not configured. Please add it to your .env.local file.')
  }

  plainOpenaiClient = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: openrouterApiKey,
  })

  return plainOpenaiClient
}

// Example usage function using chat.completions API
export async function generateSummaryWithAnalytics(
  transcript: string,
  options?: {
    model?: string
    distinctId?: string
    traceId?: string
    properties?: Record<string, unknown>
  }
) {
  const client = getOpenAIClient()
  
  const completion = await client.chat.completions.create({
    model: options?.model || 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates concise summaries of video transcripts.',
      },
      {
        role: 'user',
        content: `Please summarize the following transcript:\n\n${transcript}`,
      },
    ],
    // @ts-expect-error - PostHog properties are added by @posthog/ai wrapper
    posthogDistinctId: options?.distinctId,
    posthogTraceId: options?.traceId || `summary_${Date.now()}`,
    posthogProperties: {
      ...options?.properties,
      transcript_length: transcript.length,
    },
  })

  return completion.choices[0]?.message?.content || ''
}

// Streaming version for real-time content delivery with YouTubeSummaries-style prompts
export async function generateSummaryStreamWithAnalytics(
  transcript: string,
  options?: {
    model?: string
    distinctId?: string
    traceId?: string
    properties?: Record<string, unknown>
  }
) {
  const client = getOpenAIClient()
  
  // Truncate transcript to max length (similar to YouTubeSummaries)
  const maxLength = 6000
  const truncatedTranscript = transcript.substring(0, maxLength)
  
  // System prompt matching YouTubeSummaries style
  const systemPrompt = [
    "You are an expert at analyzing content and extracting key insights. You have a talent for breaking down complex information into clear, actionable points.",
    "",
    "FORMATTING REQUIREMENTS:",
    "- CRITICAL: Use sequential numbering (1, 2, 3, 4) for main sections and bullet points (-) for sub-points. Never restart numbering - continue the sequence throughout your response.",
    "- Format your response with clear headings and bullet points. Ensure each point is unique and valuable.",
    "- Write in a clear, conversational style that is easy to understand and engaging to read.",
    "",
    "QUALITY STANDARDS:",
    "- Ensure each point is unique and valuable. Avoid repeating the same information in different words.",
    "- Focus on insights that can be applied practically or that provide meaningful understanding.",
    "- Provide enough detail to be valuable but remain concise and focused.",
    "- Ground insights in the actual content provided, avoiding generic or speculative statements.",
    "",
    "Create a concise, well-structured summary with diverse points that help users understand and apply the content's key messages."
  ].join("\n")
  
  // User prompt matching YouTubeSummaries structure
  const userPrompt = [
    "Analyze this video transcript and provide a comprehensive summary with sequential numbering:",
    "",
    "1. Main Topic & Context",
    "2. Key Insights (3-5 unique points)",
    "3. Important Takeaways",
    "4. Practical Applications",
    "",
    "IMPORTANT: Use sequential numbering (1, 2, 3, 4) for the main sections. Use bullet points (-) for sub-points within each section.",
    "",
    "Focus on:",
    "- Understanding the core message and its context",
    "- Extracting actionable insights that viewers can apply",
    "- Identifying the most valuable takeaways",
    "- Suggesting practical applications of the concepts",
    "",
    "Transcript:",
    truncatedTranscript
  ].join("\n")

  // @ts-expect-error - PostHog properties are added by @posthog/ai wrapper
  const stream = await client.chat.completions.create({
    model: options?.model || 'anthropic/claude-3-haiku', // Use Claude like YouTubeSummaries
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 1500,
    posthogDistinctId: options?.distinctId,
    posthogTraceId: options?.traceId || `summary_${Date.now()}`,
    posthogProperties: {
      ...options?.properties,
      transcript_length: transcript.length,
    },
  })

  return stream
}

// Alternative: Using the newer responses API (if available)
export async function generateSummaryWithResponsesAPI(
  transcript: string,
  options?: {
    model?: string
    distinctId?: string
    traceId?: string
    properties?: Record<string, unknown>
  }
) {
  const client = getOpenAIClient()
  
  // Note: This uses the newer responses API if your OpenAI SDK version supports it
  // The responses API returns a different structure, so we need to handle it differently
  try {
    const response = await client.responses?.create({
      model: options?.model || 'openai/gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise summaries of video transcripts.',
        },
        {
          role: 'user',
          content: `Please summarize the following transcript:\n\n${transcript}`,
        },
      ],
      // @ts-expect-error - PostHog properties are added by @posthog/ai wrapper
      posthogDistinctId: options?.distinctId,
      posthogTraceId: options?.traceId || `summary_${Date.now()}`,
      posthogProperties: {
        ...options?.properties,
        transcript_length: transcript.length,
      },
    })

    // The responses API structure may differ - adjust based on actual response type
    return (response as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]?.message?.content || ''
  } catch (error) {
    console.error('Responses API not available, falling back to chat.completions', error)
    return generateSummaryWithAnalytics(transcript, options)
  }
}
