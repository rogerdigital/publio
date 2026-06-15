import type { Context } from 'hono';

export function apiResponse<T>(c: Context, data: T, status = 200) {
  return c.json({ ok: true, ...data }, status as never);
}

export function apiError(
  c: Context,
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
) {
  return c.json({ ok: false, error: message, ...extra }, status as never);
}
