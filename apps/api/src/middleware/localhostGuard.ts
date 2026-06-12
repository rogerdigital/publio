import type { MiddlewareHandler } from 'hono';

export const localhostGuard: MiddlewareHandler = async (c, next) => {
  const host = c.req.header('host') || '';
  const isLocal =
    host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]');

  if (!isLocal) {
    return c.json({ ok: false, error: 'Forbidden: localhost only' }, 403);
  }

  await next();
};
