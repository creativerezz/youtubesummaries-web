# Next.js API Reference

Complete documentation for the YouTube Summaries Next.js API endpoints.

**Base URL:** `https://youtubesummaries.cc` (Production) | `http://localhost:3000` (Development)

---

## Table of Contents

- [AI Endpoints](#ai-endpoints)
  - [POST /api/summarize](#post-apisummarize)
  - [POST /api/chat](#post-apichat)
- [YouTube Data Endpoints](#youtube-data-endpoints)
  - [GET /api/youtube/search](#get-apiyoutubesearch)
  - [GET /api/channel/{channelId}](#get-apichannelchannelid)
- [Subscription Endpoints](#subscription-endpoints)
  - [GET /api/checkout](#get-apicheckout)
  - [GET /api/portal](#get-apiportal)
  - [POST /api/webhook/polar](#post-apiwebhookpolar)
- [Auth Endpoints](#auth-endpoints)
  - [POST /api/beta](#post-apibeta)
  - [GET /api/auth/callback](#get-apiauthcallback)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)

---

## AI Endpoints

### POST /api/summarize

Generate an AI-powered summary from a video transcript using streaming Server-Sent Events (SSE).

**Authentication:** Optional (affects rate limit tier)

**Model:** `anthropic/claude-3-haiku` via OpenRouter

**Rate Limits:**
| User Type | Limit |
|-----------|-------|
| Anonymous | 10/min |
| Authenticated | 30/min |

#### Request

```typescript
POST /api/summarize
Content-Type: application/json

{
  "transcript": string,  // Required - Video transcript text
  "videoId"?: string,    // Optional - For analytics tracking
  "userId"?: string      // Optional - For analytics tracking
}
```

**Note:** Transcript is truncated to 6,000 characters for summarization.

#### Response (SSE Stream)

```
Content-Type: text/event-stream

data: {"content":"1. **Main Topic & Context**"}\n\n
data: {"content":"\n   - The video discusses..."}\n\n
data: {"content":" programming fundamentals"}\n\n
data: [DONE]\n\n
```

#### Response Headers

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1702387200
```

#### Example (JavaScript)

```javascript
async function streamSummary(transcript, videoId) {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, videoId })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let summary = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n\n');

    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        const json = JSON.parse(line.slice(6));
        if (json.content) {
          summary += json.content;
          console.log(json.content); // Stream to UI
        }
      }
    }
  }

  return summary;
}
```

#### Example (curl)

```bash
curl -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"transcript": "In this video we discuss...", "videoId": "abc123"}'
```

#### Error Responses

| Status | Description |
|--------|-------------|
| 400 | `{"error": "Transcript is required"}` |
| 429 | `{"error": "Rate limit exceeded...", "retryAfter": 45}` |
| 500 | `{"error": "Failed to generate summary"}` |

---

### POST /api/chat

Interactive Q&A about a video transcript using streaming SSE.

**Authentication:** Required

**Model:** `openai/gpt-4o-mini` via OpenRouter

**Rate Limit:** 20 requests/minute

**Max Duration:** 30 seconds

#### Request

```typescript
POST /api/chat
Content-Type: application/json
Cookie: sb-access-token=...

{
  "messages": [
    { "role": "user", "content": "What is the main topic?" },
    { "role": "assistant", "content": "The video discusses..." },
    { "role": "user", "content": "Can you elaborate?" }
  ],
  "transcript": string  // Max 20,000 characters
}
```

#### Response (SSE Stream)

Same format as `/api/summarize`

#### System Prompt

The chat uses this system context:
```
You are a helpful assistant. You are answering questions about the following video transcript.

TRANSCRIPT:
{transcript}

Answer the user's questions based on the transcript provided. If the answer is not in the transcript, say so.
```

#### Error Responses

| Status | Description |
|--------|-------------|
| 401 | `{"error": "Authentication required", "message": "Please sign in to use the chat feature."}` |
| 429 | `{"error": "Chat rate limit exceeded..."}` |
| 500 | `{"error": "Failed to create chat completion"}` |

---

## YouTube Data Endpoints

### GET /api/youtube/search

Search for YouTube videos with multi-tier fallback strategy.

**Authentication:** Not required

**Rate Limit:** 30 requests/minute

**Fallback Strategy:**
1. fast-proxy-api backend (`https://api1.youtubesummaries.cc`)
2. Direct YouTube Data API v3 (if `YOUTUBE_API_KEY` configured)
3. Demo videos (final fallback)

#### Request

```
GET /api/youtube/search?q={query}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |

#### Response

```typescript
{
  "videos": [
    {
      "id": "dQw4w9WgXcQ",
      "title": "Rick Astley - Never Gonna Give You Up",
      "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      "channelTitle": "Rick Astley",
      "publishedAt": "2009-10-25T06:57:33Z"
    }
  ],
  "isDemo"?: boolean,   // Present if returning demo data
  "warning"?: string    // Warning message when using fallback
}
```

#### Example

```javascript
const response = await fetch('/api/youtube/search?q=machine+learning');
const data = await response.json();

if (data.isDemo) {
  console.warn(data.warning); // "YouTube API quota exceeded..."
}

data.videos.forEach(video => {
  console.log(video.title, video.id);
});
```

#### Error Responses

| Status | Description |
|--------|-------------|
| 400 | `{"error": "Query parameter is required"}` |

---

### GET /api/channel/{channelId}

Fetch YouTube channel information and recent video uploads.

**Authentication:** Not required

**Rate Limit:** 20 requests/minute

**Cache:** 5 minutes (`revalidate: 300`)

#### Request

```
GET /api/channel/{channelId}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channelId` | path | Yes | YouTube channel ID |

#### Response

```typescript
{
  "channelInfo": {
    "title": "MrBeast",
    "description": "SUBSCRIBE FOR A COOKIE!...",
    "thumbnail": "https://yt3.ggpht.com/...",
    "subscriberCount": "454.0M"  // Formatted with commas/suffixes
  },
  "videos": [
    {
      "id": "abc123",
      "title": "100 Pilots Fight For A Private Jet",
      "thumbnail": "https://i.ytimg.com/vi/abc123/mqdefault.jpg",
      "publishedAt": "Dec 06, 2025",  // Formatted date
      "duration": "PT28M46S"          // ISO 8601 duration
    }
  ],
  "isDemo"?: boolean,
  "warning"?: string
}
```

#### Error Responses

| Status | Description |
|--------|-------------|
| 400 | `{"error": "Channel ID is required"}` |
| 404 | `{"error": "Channel not found"}` |

---

## Subscription Endpoints

### GET /api/checkout

Redirect to Polar.sh hosted checkout page.

**Authentication:** Not required

**Implementation:** Uses `@polar-sh/nextjs` Checkout component

#### Response

HTTP 302 redirect to Polar.sh checkout URL

#### Environment Variables Required

- `POLAR_ACCESS_TOKEN`
- `POLAR_SUCCESS_URL`

---

### GET /api/portal

Redirect to Polar.sh customer portal for subscription management.

**Authentication:** Required

#### Request

```
GET /api/portal
Cookie: sb-access-token=...
```

#### Response

HTTP 302 redirect to Polar.sh customer portal

#### Error Responses

| Status | Description |
|--------|-------------|
| 401 | `{"error": "Unauthorized"}` |
| 500 | `{"error": "Failed to fetch profile"}` |
| 500 | `{"error": "No subscription found. Please subscribe first."}` |

#### Implementation Details

1. Gets authenticated user session from Supabase
2. Queries `profiles` table for `polar_customer_id`
3. Redirects to Polar.sh portal with customer ID

---

### POST /api/webhook/polar

Handle Polar.sh webhook events for subscription lifecycle.

**Authentication:** Webhook signature verification

**Implementation:** Uses `@polar-sh/nextjs` Webhooks handler

#### Events Handled

| Event | Action |
|-------|--------|
| `order.created` | Update profile with customer ID, set to pro tier |
| `subscription.created` | Create subscription record, update profile |
| `subscription.updated` | Update subscription status and tier |
| `subscription.canceled` | Downgrade to free tier |
| `customer.state_changed` | Log event (placeholder) |

#### Database Updates

**profiles table:**
- `polar_customer_id`
- `subscription_tier` ('free' | 'pro')
- `subscription_status`
- `credits_remaining` (free: 10, pro: 100)

**subscriptions table:**
- `user_id`
- `polar_subscription_id`
- `polar_product_id`
- `status`
- `current_period_start`
- `current_period_end`
- `cancel_at_period_end`

#### Environment Variables Required

- `POLAR_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Auth Endpoints

### POST /api/beta

Register email for beta waitlist.

**Authentication:** Not required

**Rate Limit:** 5 requests/hour per IP

#### Request

```typescript
POST /api/beta
Content-Type: application/json

{
  "email": "user@example.com",  // Required, valid email
  "source"?: "homepage"         // Optional, default: "website"
}
```

#### Response

```typescript
// 201 Created - New signup
{ "message": "Successfully joined the beta waitlist!" }

// 200 OK - Already registered
{ "message": "You're already on the list! We'll be in touch soon." }
```

#### Error Responses

| Status | Description |
|--------|-------------|
| 400 | `{"error": "Please enter a valid email address"}` |
| 429 | `{"error": "Too many signup attempts. Please try again later."}` |
| 500 | `{"error": "Failed to join waitlist. Please try again."}` |

#### Validation

Uses Zod schema:
```typescript
const betaSignupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  source: z.string().optional().default("website"),
});
```

---

### GET /api/auth/callback

Handle Supabase OAuth callback.

**Authentication:** OAuth flow (not required)

#### Request

```
GET /api/auth/callback?code={code}&next={redirect_url}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | Authorization code from OAuth provider |
| `next` | string | No | Redirect URL after auth (default: "/") |

#### Response

HTTP 302 redirect to `next` parameter URL after session exchange

---

## Rate Limiting

Rate limiting uses Upstash Redis with sliding window algorithm.

### Rate Limit Configuration

| Endpoint | Anonymous | Authenticated |
|----------|-----------|---------------|
| `/api/summarize` | 10/min | 30/min |
| `/api/chat` | N/A | 20/min |
| `/api/youtube/search` | 30/min | 30/min |
| `/api/channel/{id}` | 20/min | 20/min |
| `/api/beta` | 5/hour | 5/hour |

### Response Headers

All rate-limited endpoints return these headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1702387200
```

### Rate Limit Error Response (429)

```typescript
{
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 45  // Seconds until reset
}
```

Additional header:
```
Retry-After: 45
```

---

## Error Handling

### Standard Error Format

```typescript
{
  "error": "Error message"
}
```

### Authentication Error Format

```typescript
{
  "error": "Authentication required",
  "message": "Please sign in to use the chat feature."
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 302 | Redirect |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## TypeScript Types

### Request Types

```typescript
interface SummarizeRequest {
  transcript: string;
  videoId?: string;
  userId?: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  transcript: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface BetaSignupRequest {
  email: string;
  source?: string;
}
```

### Response Types

```typescript
interface VideoSummary {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

interface SearchResponse {
  videos: VideoSummary[];
  isDemo?: boolean;
  warning?: string;
}

interface ChannelInfo {
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
}

interface ChannelVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
}

interface ChannelResponse {
  channelInfo: ChannelInfo;
  videos: ChannelVideo[];
  isDemo?: boolean;
  warning?: string;
}

interface SSEChunk {
  content?: string;
  error?: string;
}

interface RateLimitError {
  error: string;
  retryAfter: number;
}
```

---

## Related Documentation

- [OpenAPI Specification](../openapi.yaml) - Machine-readable API spec
- [Cloudflare Worker API](./WORKER_API.md) - Transcript caching layer
- [fast-proxy-api](../API_REFERENCE.md) - Transcript source API
