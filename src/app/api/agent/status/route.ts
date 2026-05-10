import { NextResponse } from 'next/server';
import { isAgentConfigured } from '@/lib/agent/config';

export const dynamic = 'force-dynamic';

/** 客户端用于检查 Agent 是否已配置（不暴露密钥） */
export async function GET() {
  return NextResponse.json({ available: isAgentConfigured() });
}
