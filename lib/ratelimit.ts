import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash is configured
const isConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

// Create Redis instance only if configured
const redis = isConfigured ? Redis.fromEnv() : null;

/**
 * Payment endpoints: 5 requests per minute per IP
 * Prevents spam on checkout and payment initialization
 */
export const paymentRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "@awuraba/payment",
    })
  : null;

/**
 * General API rate limit: 60 requests per minute per IP
 * Use for public endpoints that need protection
 */
export const apiRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "@awuraba/api",
    })
  : null;

/**
 * Helper to check rate limit
 * Returns { success: true } if rate limit is not configured (dev mode)
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<{ success: boolean; reset?: number }> {
  if (!limiter) {
    // Not configured - allow request (dev mode)
    return { success: true };
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    reset: result.reset,
  };
}
