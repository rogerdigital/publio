import { describe, expect, test, vi } from 'vitest';

vi.mock('@/lib/agent/config', () => ({
  getAgentConfig: () => null,
}));

import { POST } from '@/app/api/agent/feedback/route';
import { NextRequest } from 'next/server';

function createJsonRequest(body: unknown) {
  return new NextRequest('http://localhost/api/agent/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/agent/feedback', () => {
  test('returns 503 when agent not configured', async () => {
    const res = await POST(
      createJsonRequest({
        platform: 'wechat',
        title: '测试文章',
        metrics: { views: 100, likes: 10, comments: 5, shares: 2 },
      }),
    );
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toBe('Agent 未配置');
  });
});
