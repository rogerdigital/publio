import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, maybeCleanup } from '@/lib/rateLimit';

const LOCALHOST_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

function isLocalhost(host: string): boolean {
  try {
    const { hostname } = new URL(`http://${host}`);
    return LOCALHOST_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const host = request.headers.get('host');
  if (!host || !isLocalhost(host)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const originHost = new URL(origin).hostname;
      if (!LOCALHOST_HOSTS.includes(originHost)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Rate limiting for API routes
  if (request.method !== 'GET' || pathname.startsWith('/api/agent/')) {
    maybeCleanup();
    const result = checkRateLimit(request);
    if (!result.allowed) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
