import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '../types';

interface SentryEvent {
  event_id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  platform: string;
  server_name: string;
  environment: string;
  exception: {
    values: Array<{
      type: string;
      value: string;
      stacktrace?: {
        frames: Array<{
          filename: string;
          function: string;
          lineno?: number;
        }>;
      };
    }>;
  };
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
  };
  user?: {
    id: string;
    email: string;
  };
  tags: Record<string, string>;
}

function generateEventId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function parseDsn(dsn: string): { publicKey: string; host: string; projectId: string } | null {
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const host = url.hostname;
    const projectId = url.pathname.slice(1);
    return { publicKey, host, projectId };
  } catch {
    return null;
  }
}

async function sendToSentry(dsn: string, event: SentryEvent): Promise<void> {
  const parsed = parseDsn(dsn);
  if (!parsed) {
    console.error('Invalid Sentry DSN');
    return;
  }

  const { publicKey, host, projectId } = parsed;
  const sentryUrl = `https://${host}/api/${projectId}/store/`;

  try {
    await fetch(sentryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=dealdhamal-workers/1.0, sentry_key=${publicKey}`,
      },
      body: JSON.stringify(event),
    });
  } catch (err) {
    console.error('Failed to send event to Sentry:', err);
  }
}

/**
 * Sentry error capture middleware for Cloudflare Workers.
 * Uses the Sentry HTTP API directly (no Node.js SDK required).
 * Captures unhandled errors with request context.
 */
export const sentryMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  try {
    await next();
  } catch (error) {
    const dsn = c.env.SENTRY_DSN;
    if (!dsn) {
      throw error;
    }

    const err = error instanceof Error ? error : new Error(String(error));
    const user = c.get('user');

    const event: SentryEvent = {
      event_id: generateEventId(),
      timestamp: new Date().toISOString(),
      level: 'error',
      platform: 'javascript',
      server_name: 'dealdhamal-backend',
      environment: c.env.ENVIRONMENT || 'production',
      exception: {
        values: [
          {
            type: err.name,
            value: err.message,
            stacktrace: err.stack
              ? {
                  frames: err.stack
                    .split('\n')
                    .slice(1, 10)
                    .map((line) => {
                      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+)/);
                      return {
                        function: match?.[1] || '<anonymous>',
                        filename: match?.[2] || '<unknown>',
                        lineno: match?.[3] ? parseInt(match[3], 10) : undefined,
                      };
                    }),
                }
              : undefined,
          },
        ],
      },
      request: {
        url: c.req.url,
        method: c.req.method,
        headers: {
          'user-agent': c.req.header('user-agent') || '',
          'content-type': c.req.header('content-type') || '',
        },
      },
      user: user ? { id: user.id, email: user.email } : undefined,
      tags: {
        route: c.req.path,
        method: c.req.method,
      },
    };

    // Send to Sentry asynchronously (use waitUntil in Workers for best effort)
    c.executionCtx.waitUntil(sendToSentry(dsn, event));

    // Re-throw the error so Hono's error handler can respond
    throw error;
  }
});
