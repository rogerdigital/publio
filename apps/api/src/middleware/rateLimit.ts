import type { MiddlewareHandler } from 'hono';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const DEFAULT_LIMIT = 60;
const DEFAULT_WINDOW_MS = 60_000;
const AGENT_LIMIT = 10;
const CLEANUP_INTERVAL = 300_000;

const store = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

function isAgentEndpoint(pathname: string): boolean {
  return pathname.startsWith('/api/agent/');
}

function maybeCleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}

export const rateLimit: MiddlewareHandler = async (c, next) => {
  const method = c.req.method;
  const pathname = new URL(c.req.url).pathname;

  // Only rate-limit mutating requests and all agent endpoints
  if (method === 'GET' && !isAgentEndpoint(pathname)) {
    return next();
  }

  maybeCleanup();

  // 本地单用户工具：所有请求同源，直接用固定 key。
  // 之前信任 x-forwarded-for / x-real-ip，这两个头完全可伪造，换 IP 即可绕过限流。
  const isAgent = isAgentEndpoint(pathname);
  const limit = isAgent ? AGENT_LIMIT : DEFAULT_LIMIT;
  const now = Date.now();
  const key = isAgent ? 'local:agent' : 'local:default';
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + DEFAULT_WINDOW_MS });
    return next();
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return c.json({ ok: false, error: '请求过于频繁，请稍后重试' }, 429, {
      'Retry-After': String(retryAfter),
    });
  }

  entry.count++;
  return next();
};
