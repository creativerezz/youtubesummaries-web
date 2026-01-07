import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Singleton Redis client
let redis: Redis | null = null;
let redisConfigured = true;

function getRedisClient(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redisConfigured = false;
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Upstash Redis not configured. Rate limiting disabled for development."
      );
    }
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

/**
 * Check if Redis/rate limiting is configured
 */
export function isRateLimitingEnabled(): boolean {
  getRedisClient(); // Trigger config check
  return redisConfigured;
}

// Lazy initialization to avoid errors when env vars are missing during build
function createRateLimiter(
  limiter: ReturnType<typeof Ratelimit.slidingWindow>,
  prefix: string
) {
  let instance: Ratelimit | null = null;

  return (): Ratelimit | null => {
    if (instance) return instance;

    const redisClient = getRedisClient();
    if (!redisClient) {
      return null; // Rate limiting disabled
    }

    instance = new Ratelimit({
      redis: redisClient,
      limiter,
      prefix,
      analytics: true,
    });

    return instance;
  };
}

// Rate limiters for different endpoints
export const rateLimiters = {
  // Summarize: 10 requests per minute for anonymous
  summarizeAnonymous: createRateLimiter(
    Ratelimit.slidingWindow(10, "1 m"),
    "ratelimit:summarize:anon:"
  ),

  // Summarize: 30 requests per minute for authenticated users
  summarizeAuthenticated: createRateLimiter(
    Ratelimit.slidingWindow(30, "1 m"),
    "ratelimit:summarize:auth:"
  ),

  // Chat: 20 requests per minute (authenticated only)
  chat: createRateLimiter(
    Ratelimit.slidingWindow(20, "1 m"),
    "ratelimit:chat:"
  ),

  // Beta signup: 5 per hour per IP
  betaSignup: createRateLimiter(
    Ratelimit.slidingWindow(5, "1 h"),
    "ratelimit:beta:"
  ),

  // YouTube search: Anonymous users - 10 per hour (more restrictive)
  youtubeSearchAnonymous: createRateLimiter(
    Ratelimit.slidingWindow(10, "1 h"),
    "ratelimit:youtube:search:anon:"
  ),

  // YouTube search: Authenticated free users - 30 per hour
  youtubeSearchAuthenticated: createRateLimiter(
    Ratelimit.slidingWindow(30, "1 h"),
    "ratelimit:youtube:search:auth:"
  ),

  // YouTube search: Pro users - 100 per hour
  youtubeSearchPro: createRateLimiter(
    Ratelimit.slidingWindow(100, "1 h"),
    "ratelimit:youtube:search:pro:"
  ),

  // Channel fetch: 20 per minute
  channelFetch: createRateLimiter(
    Ratelimit.slidingWindow(20, "1 m"),
    "ratelimit:channel:"
  ),
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

/**
 * Check rate limit for a given identifier
 */
export async function checkRateLimit(
  getLimiter: () => Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  try {
    const limiter = getLimiter();

    // If rate limiting is not configured, allow all requests
    if (!limiter) {
      return {
        success: true,
        limit: 0,
        remaining: 0,
        reset: 0,
      };
    }

    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // If rate limiting fails (e.g., Redis down), allow the request
    console.error("Rate limit check failed:", error);
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }
}

/**
 * Get identifier for rate limiting (user ID or IP address)
 */
export function getIdentifier(
  request: Request,
  userId?: string | null
): string {
  if (userId) return userId;

  // Get IP from headers (works with Vercel/Cloudflare)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");

  const ip = cfIp || forwarded?.split(",")[0]?.trim() || realIp || "unknown";
  return ip;
}

/**
 * Create rate limit response headers
 */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
}

/**
 * Create a 429 Too Many Requests response
 */
export function rateLimitResponse(
  result: RateLimitResult,
  message?: string
): Response {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: message || "Rate limit exceeded. Please try again later.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        ...rateLimitHeaders(result),
      },
    }
  );
}
