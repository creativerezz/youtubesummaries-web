# Cloudflare Worker API Reference

Documentation for the YouTube Transcript Storage Worker - a D1 caching layer for YouTube transcripts.

**Base URL:** `https://youtube-transcript-storage.automatehub.workers.dev`

**Client Library:** `lib/youtube-transcript-api.ts`

---

## Table of Contents

- [Overview](#overview)
- [Endpoints](#endpoints)
  - [POST /fetch](#post-fetch)
  - [GET /transcript/{videoId}](#get-transcriptvideoid)
  - [GET /transcripts](#get-transcripts)
  - [DELETE /transcript/{videoId}](#delete-transcriptvideoid)
- [TypeScript Client](#typescript-client)
- [Data Types](#data-types)
- [Error Handling](#error-handling)

---

## Overview

The Cloudflare Worker acts as an **edge caching layer** between the Next.js application and the upstream fast-proxy-api server. It stores transcripts in a D1 (SQLite) database to reduce load on the upstream API and improve response times globally.

### Why D1 Instead of Supabase?

The project uses **two databases**:
- **Supabase (PostgreSQL)** - User auth, profiles, subscriptions
- **Cloudflare D1 (SQLite)** - Transcript edge cache

D1 was chosen for transcripts because:
1. **Edge latency** - D1 runs on Cloudflare's edge network (fast globally)
2. **Separation of concerns** - Transcripts are read-heavy cache data, not user data
3. **Cost** - D1 has generous free tier for read-heavy workloads

> **Note:** Could be consolidated to Supabase in the future if edge performance isn't critical.

### Architecture

```
Next.js App
    ↓
Cloudflare Worker (D1 Cache)
    ↓ (cache miss)
fast-proxy-api (api1.youtubesummaries.cc)
```

### Cache Behavior

- **Cache Hit:** Returns stored transcript immediately
- **Cache Miss:** Fetches from upstream, stores in D1, returns data
- **Force Refresh:** `force: true` parameter bypasses cache

---

## Endpoints

### POST /fetch

Fetch a YouTube transcript and cache it in D1.

#### Request

```typescript
POST /fetch
Content-Type: application/json

{
  "video": string,        // YouTube URL or video ID (required)
  "languages": string[],  // Language codes, default: ["en"]
  "force": boolean        // Force refetch, default: false
}
```

#### Video ID Formats Supported

```
dQw4w9WgXcQ                                    // Video ID
https://www.youtube.com/watch?v=dQw4w9WgXcQ    // Full URL
https://youtu.be/dQw4w9WgXcQ                   // Short URL
https://www.youtube.com/embed/dQw4w9WgXcQ      // Embed URL
```

#### Response

```typescript
// 200 OK
{
  "message": "Transcript fetched and stored",
  "cached": false,  // true if retrieved from cache
  "data": {
    "id": 1,
    "video_id": "dQw4w9WgXcQ",
    "title": "Rick Astley - Never Gonna Give You Up (Official Video)",
    "author_name": "Rick Astley",
    "author_url": "https://www.youtube.com/@RickAstleyYT",
    "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "captions": "We're no strangers to love...",
    "timestamps": [
      "0:01 - [Music]",
      "0:18 - We're no strangers to love"
    ],
    "language_code": "en",
    "is_ai_generated": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Example (curl)

```bash
# Fetch transcript for video
curl -X POST https://youtube-transcript-storage.automatehub.workers.dev/fetch \
  -H "Content-Type: application/json" \
  -d '{"video": "dQw4w9WgXcQ", "languages": ["en"]}'

# Force refetch (bypass cache)
curl -X POST https://youtube-transcript-storage.automatehub.workers.dev/fetch \
  -H "Content-Type: application/json" \
  -d '{"video": "dQw4w9WgXcQ", "force": true}'
```

#### Example (JavaScript)

```javascript
async function fetchTranscript(videoId, languages = ['en'], force = false) {
  const response = await fetch('https://youtube-transcript-storage.automatehub.workers.dev/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video: videoId, languages, force })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch transcript');
  }

  const result = await response.json();
  console.log(`Cached: ${result.cached}`);
  return result.data;
}
```

#### Error Responses

| Status | Description |
|--------|-------------|
| 400 | `{"error": "video parameter is required"}` |
| 500 | `{"error": "Failed to fetch transcript from upstream"}` |

---

### GET /transcript/{videoId}

Retrieve a cached transcript by video ID.

#### Request

```
GET /transcript/{videoId}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `videoId` | path | YouTube video ID (11 characters) |

#### Response

```typescript
// 200 OK - Transcript found
{
  "id": 1,
  "video_id": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up",
  "author_name": "Rick Astley",
  "author_url": "https://www.youtube.com/@RickAstleyYT",
  "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "captions": "We're no strangers to love...",
  "timestamps": [
    "0:01 - [Music]",
    "0:18 - We're no strangers to love"
  ],
  "language_code": "en",
  "is_ai_generated": 0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}

// 404 Not Found - Transcript not cached
```

#### Example (curl)

```bash
curl https://youtube-transcript-storage.automatehub.workers.dev/transcript/dQw4w9WgXcQ
```

#### Example (JavaScript)

```javascript
async function getTranscript(videoId) {
  const response = await fetch(
    `https://youtube-transcript-storage.automatehub.workers.dev/transcript/${videoId}`
  );

  if (response.status === 404) {
    return null; // Not cached
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get transcript');
  }

  return response.json();
}
```

---

### GET /transcripts

List all cached transcripts with pagination.

#### Request

```
GET /transcripts?limit={limit}&offset={offset}
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | query | 50 | Max results (1-100) |
| `offset` | query | 0 | Results to skip |

#### Response

```typescript
// 200 OK
{
  "transcripts": [
    {
      "id": 23,
      "video_id": "4v4PJoxm8Bc",
      "title": "8/29: Will Imam Mahdi Force Everyone To Follow Islam?",
      "author_name": "Thaqlain",
      "created_at": "2025-12-12 06:09:33",
      "updated_at": "2025-12-12 06:09:33"
    },
    {
      "id": 22,
      "video_id": "jgrkV_hJdJw",
      "title": "Micro-interactions to delight your users",
      "author_name": "The Design Engineer",
      "created_at": "2025-12-11 22:25:48",
      "updated_at": "2025-12-11 22:25:48"
    }
  ],
  "limit": 50,
  "offset": 0
}
```

#### Example (curl)

```bash
# Get first 10 transcripts
curl "https://youtube-transcript-storage.automatehub.workers.dev/transcripts?limit=10"

# Get next page
curl "https://youtube-transcript-storage.automatehub.workers.dev/transcripts?limit=10&offset=10"
```

#### Example (JavaScript)

```javascript
async function listTranscripts(limit = 50, offset = 0) {
  const response = await fetch(
    `https://youtube-transcript-storage.automatehub.workers.dev/transcripts?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list transcripts');
  }

  return response.json();
}

// Usage
const result = await listTranscripts(10, 0);
console.log(`Found ${result.transcripts.length} transcripts`);
```

---

### DELETE /transcript/{videoId}

Remove a transcript from the cache.

#### Request

```
DELETE /transcript/{videoId}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `videoId` | path | YouTube video ID |

#### Response

```typescript
// 200 OK
{
  "message": "Transcript deleted"
}

// 404 Not Found
{
  "error": "Transcript not found"
}
```

#### Example (curl)

```bash
curl -X DELETE https://youtube-transcript-storage.automatehub.workers.dev/transcript/dQw4w9WgXcQ
```

---

## TypeScript Client

The project includes a TypeScript client at `lib/youtube-transcript-api.ts`:

```typescript
import {
  fetchTranscript,
  getTranscript,
  listTranscripts,
  deleteTranscript,
  extractVideoId,
  type TranscriptResponse,
  type FetchTranscriptResponse
} from '@/lib/youtube-transcript-api';

// Fetch and cache a transcript
const result = await fetchTranscript('dQw4w9WgXcQ', ['en'], false);
console.log(result.data.title);
console.log(result.cached); // true if from cache

// Get cached transcript
const transcript = await getTranscript('dQw4w9WgXcQ');
if (transcript) {
  console.log(transcript.captions);
}

// List all transcripts
const list = await listTranscripts(50, 0);
list.transcripts.forEach(t => console.log(t.title));

// Delete transcript
await deleteTranscript('dQw4w9WgXcQ');

// Extract video ID from URL
const videoId = extractVideoId('https://youtu.be/dQw4w9WgXcQ');
// Returns: 'dQw4w9WgXcQ'
```

### Client Configuration

The base URL can be configured via environment variable:

```env
NEXT_PUBLIC_TRANSCRIPT_API_URL=https://youtube-transcript-storage.automatehub.workers.dev
```

Default: `https://youtube-transcript-storage.automatehub.workers.dev`

---

## Data Types

### TranscriptResponse

Full transcript record from the database:

```typescript
interface TranscriptResponse {
  id: number;
  video_id: string;
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
  captions: string;           // Plain text transcript
  timestamps: string | string[]; // May be JSON string or array
  language_code: string;      // e.g., "en"
  is_ai_generated: 0 | 1;     // 0 = human, 1 = auto-generated
  created_at: string;         // ISO timestamp
  updated_at: string;         // ISO timestamp
}
```

### FetchTranscriptResponse

Response from POST /fetch:

```typescript
interface FetchTranscriptResponse {
  message: string;
  cached: boolean;
  data: TranscriptResponse;
}
```

### TranscriptListItem

Abbreviated record for list endpoint:

```typescript
interface TranscriptListItem {
  id: number;
  video_id: string;
  title: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}
```

---

## Error Handling

### Error Response Format

```typescript
{
  "error": "Error message"
}
```

### Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | "video parameter is required" | Missing video in POST /fetch |
| 404 | "Transcript not found" | Video not in cache |
| 500 | "Failed to fetch transcript from upstream" | Upstream API error |
| 500 | "Database error" | D1 database issue |

### Error Handling Example

```typescript
async function safeGetTranscript(videoId: string) {
  try {
    const transcript = await getTranscript(videoId);

    if (!transcript) {
      // Not cached - fetch it
      const result = await fetchTranscript(videoId);
      return result.data;
    }

    return transcript;
  } catch (error) {
    console.error('Transcript error:', error.message);
    throw error;
  }
}
```

---

## Related Documentation

- [Next.js API Reference](./NEXTJS_API.md) - Main application endpoints
- [fast-proxy-api](../API_REFERENCE.md) - Transcript source API
- [OpenAPI Specification](../openapi.yaml) - Machine-readable API spec
