import { NextRequest, NextResponse } from 'next/server';

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

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
