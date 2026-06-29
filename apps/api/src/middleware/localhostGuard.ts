import type { MiddlewareHandler } from 'hono';

/**
 * 拒绝非本地请求。
 * 主防线是 API server 只绑定 127.0.0.1，这里基于 Host 头做辅助校验。
 * 注意：Host 头由客户端发送、可伪造，不能作为唯一安全依据。
 */
export const localhostGuard: MiddlewareHandler = async (c, next) => {
  const host = c.req.header('host') || '';
  const isLocal =
    host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]');

  if (!isLocal) {
    return c.json({ ok: false, error: 'Forbidden: localhost only' }, 403);
  }

  await next();
};
