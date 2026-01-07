import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

export function getPostHogClient(): PostHog | null {
  if (posthogClient) {
    return posthogClient
  }

  const posthogKey = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!posthogKey || !posthogHost) {
    console.warn('PostHog API key or host not configured. LLM analytics will be disabled.')
    return null
  }

  posthogClient = new PostHog(posthogKey, {
    host: posthogHost,
    flushAt: 20,
    flushInterval: 10000,
  })

  return posthogClient
}

// Cleanup function for graceful shutdown
export function shutdownPostHog() {
  if (posthogClient) {
    posthogClient.shutdown()
    posthogClient = null
  }
}

