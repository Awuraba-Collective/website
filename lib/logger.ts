import { SeverityNumber } from "@opentelemetry/api-logs";
import { after } from "next/server";
import { loggerProvider } from "@/instrumentation";

// ---------------------------------------------------------------------------
// Typed logger returned by getLogger()
// ---------------------------------------------------------------------------
export interface AppLogger {
  info(body: string, attributes?: Record<string, string | number | boolean>): void;
  warn(body: string, attributes?: Record<string, string | number | boolean>): void;
  error(body: string, attributes?: Record<string, string | number | boolean>): void;
}

/**
 * Returns a named logger with convenience severity helpers.
 *
 * @param name  A short, dot-separated scope, e.g. "payments/initialize"
 *              This becomes the `logger.name` in PostHog.
 *
 * @example
 *   const log = getLogger("payments/initialize")
 *   log.info("Payment started", { reference, ip })
 *   log.error("Paystack failed", { error: e.message })
 */
export function getLogger(name: string): AppLogger {
  const logger = loggerProvider.getLogger(name);

  return {
    info(body, attributes) {
      logger.emit({ body, severityNumber: SeverityNumber.INFO, attributes });
    },
    warn(body, attributes) {
      logger.emit({ body, severityNumber: SeverityNumber.WARN, attributes });
    },
    error(body, attributes) {
      logger.emit({ body, severityNumber: SeverityNumber.ERROR, attributes });
    },
  };
}

// ---------------------------------------------------------------------------
// withFlush — wraps a Next.js route handler and auto-flushes logs via after()
// ---------------------------------------------------------------------------
type RouteHandler<T extends Request = Request> = (req: T) => Promise<Response>;

/**
 * Wraps a Next.js App Router route handler so that `loggerProvider.forceFlush()`
 * is always called after the response is sent.  Prevents log loss in
 * short-lived serverless functions.
 *
 * @example
 *   export const POST = withFlush(async (request) => {
 *     log.info("handler called")
 *     return Response.json({ ok: true })
 *   })
 */
export function withFlush<T extends Request>(handler: RouteHandler<T>): RouteHandler<T> {
  return async (req: T) => {
    const response = await handler(req);
    after(async () => {
      await loggerProvider.forceFlush();
    });
    return response;
  };
}
