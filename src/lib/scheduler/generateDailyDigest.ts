import { fetchAiNewsSignals, buildAiNewsDeskFromSignals } from '@/lib/ai-news';
import { getDraftRegistry } from '@/lib/drafts/registry';
import { logger } from '@/lib/logger';

const TOP_N = 5;

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function generateDailyDigest() {
  const now = new Date();
  const dateStr = formatDate(now);
  const digestTag = `daily-digest-${dateStr}`;

  const registry = getDraftRegistry();
  const existing = registry.listDrafts().find((d) => d.tags?.includes(digestTag));
  if (existing) {
    logger.info(`Daily digest for ${dateStr} already exists (${existing.id})`);
    return;
  }

  const signals = await fetchAiNewsSignals(24);
  if (signals.length === 0) {
    logger.info('No signals found, skipping daily digest');
    return;
  }

  const desk = buildAiNewsDeskFromSignals(signals, now, 40);
  const allCandidates = [...desk.todayCandidates, ...desk.followCandidates]
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, TOP_N);

  if (allCandidates.length === 0) {
    logger.info('No candidates scored, skipping daily digest');
    return;
  }

  const sections = allCandidates.map((c, i) => {
    const score = Math.round(c.totalScore);
    const sources = c.signals.map((s) => s.sourceName).filter((v, j, a) => a.indexOf(v) === j);
    const mainLink = c.primarySignal.link;

    let section = `## ${i + 1}. ${c.title}\n\n`;
    section += `**精选指数**: ${score} | **来源数**: ${c.coverageCount} | **信源**: ${sources.slice(0, 3).join('、')}\n\n`;

    if (c.primarySignal.summary) {
      section += `${c.primarySignal.summary}\n\n`;
    }

    if (c.whyNow) {
      section += `> **为什么值得关注**: ${c.whyNow}\n>\n`;
    }

    if (c.researchBrief.recommendedAngles.length > 0) {
      const angle = c.researchBrief.recommendedAngles[0];
      section += `> **推荐写法**: ${angle.label} — ${angle.reason}\n>\n`;
    }

    section += `[阅读原文](${mainLink})\n`;
    return section;
  });

  const intro = [
    `# AI 日报 · ${dateStr}\n`,
    `> ${desk.totalSignals} 条信源，精选 ${allCandidates.length} 条值得关注的话题。\n`,
    `---\n`,
  ].join('\n');

  const footer = `\n---\n\n*由 Publio 自动生成 · ${now.toLocaleString('zh-CN')}*`;

  const content = intro + sections.join('\n---\n\n') + footer;

  const draft = registry.createDraft({
    title: `AI 日报 · ${dateStr}`,
    content,
    source: 'ai-news',
    tags: ['daily-digest', digestTag],
  });

  logger.info(
    `Daily digest created: ${draft.id} (${allCandidates.length} topics, ${signals.length} signals)`,
  );
}

export function getDigestIntervalMs() {
  return 24 * 60 * 60 * 1000;
}
