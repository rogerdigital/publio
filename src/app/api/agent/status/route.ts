import { NextResponse } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';

export const dynamic = 'force-dynamic';

/** 客户端用于检查 Agent 是否已配置（不暴露密钥） */
export async function GET() {
  try {
    const config = getAgentConfig();
    if (!config) {
      return NextResponse.json({ available: false });
    }
    return NextResponse.json({
      available: true,
      provider: config.provider,
      model: config.model,
    });
  } catch {
    return NextResponse.json({ available: false });
  }
}
