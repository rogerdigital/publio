import { NextResponse } from 'next/server';
import { buildAiNewsDesk } from '@/lib/aiNews';

export const dynamic = 'force-dynamic';

const DISPLAY_SIZE = 10;

export async function GET() {
  try {
    const desk = await buildAiNewsDesk(24, 40);

    const allCandidates = [...desk.todayCandidates, ...desk.followCandidates].slice(0, DISPLAY_SIZE);
    const todayCandidates = allCandidates.filter((c) => c.bucket === 'today');
    const followCandidates = allCandidates.filter((c) => c.bucket === 'follow');
    const selectedResearch =
      todayCandidates[0]?.researchBrief ?? followCandidates[0]?.researchBrief ?? null;

    return NextResponse.json({
      success: true,
      generatedAt: desk.generatedAt,
      totalSignals: desk.totalSignals,
      totalCandidates: desk.totalCandidates,
      todayCandidates,
      followCandidates,
      selectedResearch,
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
