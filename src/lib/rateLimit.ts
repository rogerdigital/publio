interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const DEFAULT_LIMIT = 60;
const DEFAULT_WINDOW_MS = 60_000;

const AGENT_LIMIT = 10;

const store = new Map<string, RateLimitEntry>();

function getIp(request: { headers: Headers }): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

function isAgentEndpoint(pathname: string): boolean {
  return pathname.startsWith('/api/agent/');
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfter: number;
}

export function checkRateLimit(request: {
  headers: Headers;
  nextUrl: { pathname: string };
}): RateLimitResult {
  const ip = getIp(request);
  const pathname = request.nextUrl.pathname;
  const limit = isAgentEndpoint(pathname) ? AGENT_LIMIT : DEFAULT_LIMIT;
  const now = Date.now();
  const key = `${ip}:${isAgentEndpoint(pathname) ? 'agent' : 'default'}`;

  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + DEFAULT_WINDOW_MS });
    return { allowed: true, remaining: limit - 1, limit, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, limit, retryAfter };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, limit, retryAfter: 0 };
}

// Periodic cleanup to prevent memory leaks from abandoned IPs
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 300_000; // 5 minutes

export function maybeCleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}
