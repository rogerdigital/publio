import { NextResponse } from 'next/server';
import { buildAiNewsDesk } from '@/lib/aiNews';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const desk = await buildAiNewsDesk(72);

    return NextResponse.json({
      success: true,
      generatedAt: desk.generatedAt,
      totalSignals: desk.totalSignals,
      totalCandidates: desk.totalCandidates,
      todayCandidates: desk.todayCandidates,
      followCandidates: desk.followCandidates,
      selectedResearch: desk.selectedResearch,
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
