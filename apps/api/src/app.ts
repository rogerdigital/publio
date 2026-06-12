import { Hono } from 'hono';
import { localhostGuard } from './middleware/localhostGuard.js';

export const app = new Hono();

// 全局中间件：仅允许 localhost 访问
app.use('*', localhostGuard);

// 健康检查
app.get('/api/health', (c) => c.json({ ok: true }));
