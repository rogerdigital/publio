import { NextResponse } from 'next/server';
import { fetchAiNews, generateAiNewsBriefs } from '@/lib/aiNews';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await fetchAiNews(12);
    const briefs = generateAiNewsBriefs(items);

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      windowHours: 12,
      total: items.length,
      briefs,
      items,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch AI news.';

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
}
