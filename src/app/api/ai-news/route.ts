import { NextResponse } from 'next/server';
import { buildAiNewsDesk } from '@/lib/aiNews';

export const dynamic = 'force-dynamic';

const DISPLAY_SIZE = 10;

export async function GET() {
  try {
    const desk = await buildAiNewsDesk(24, 40, DISPLAY_SIZE);

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
