import type {
  ResearchBrief,
  ResearchEvidence,
  ResearchAngle,
  ResearchPerspective,
  ScoredAiNewsCluster,
} from '@/lib/ai-news/types';

function topicHeadline(topicTags: string[]) {
  if (topicTags.includes('算力与芯片')) {
    return '算力与芯片供给';
  }
  if (topicTags.includes('资本与商业化')) {
    return '商业化与收入兑现';
  }
  if (topicTags.includes('监管与治理')) {
    return '监管边界与平台响应';
  }

  return '模型与产品竞争';
}

function buildWhyItMatters(cluster: ScoredAiNewsCluster) {
  const impactObject =
    cluster.topicTags.includes('算力与芯片')
      ? '下一阶段的训练成本、推理效率和供给节奏'
      : cluster.topicTags.includes('资本与商业化')
        ? '行业对收入兑现和商业化进度的判断'
        : cluster.topicTags.includes('监管与治理')
          ? '平台规则、企业决策和市场预期'
          : '模型能力、产品采用速度和竞争格局';

  const coverageContext =
    cluster.coverageCount >= 5
      ? `已有 ${cluster.coverageCount} 条交叉报道`
      : `当前 ${cluster.coverageCount} 条来源指向同一事件`;

  const sourceContext =
    cluster.officialSourceCount > 0 ? '含官方信源' : '来自媒体交叉报道';

  const scoreContext =
    cluster.scores.impact >= 80
      ? '影响力评分较高'
      : cluster.scores.impact >= 60
        ? '具有一定行业影响'
        : '短期关注度较强';

  return `${coverageContext}（${sourceContext}），${scoreContext}，直接关系到 ${impactObject}。结合当前 ${topicHeadline(cluster.topicTags)} 主线，具备在中文内容场持续放大的条件。`;
}

function buildAffectedAudience(cluster: ScoredAiNewsCluster) {
  const audience = new Set<string>();

  if (cluster.topicTags.includes('模型与产品发布')) {
    audience.add('模型厂商');
    audience.add('AI 应用公司');
    audience.add('开发者');
  }
  if (cluster.topicTags.includes('算力与芯片')) {
    audience.add('模型厂商');
    audience.add('企业客户');
    audience.add('投资市场');
  }
  if (cluster.topicTags.includes('资本与商业化')) {
    audience.add('AI 应用公司');
    audience.add('投资市场');
    audience.add('内容创作者');
  }
  if (cluster.topicTags.includes('监管与治理')) {
    audience.add('企业客户');
    audience.add('内容创作者');
    audience.add('开发者');
  }

  if (audience.size === 0) {
    audience.add('内容创作者');
    audience.add('开发者');
  }

  return Array.from(audience);
}

function buildAngles(cluster: ScoredAiNewsCluster): ResearchAngle[] {
  const angles: ResearchAngle[] = [
    {
      label: '新闻解读型',
      reason: '适合快速解释这件事发生了什么，以及它为什么比普通动态更值得看。',
    },
    {
      label: '公司竞争型',
      reason: '适合把它放回厂商竞赛、产品路线或平台格局里重新解释。',
    },
  ];

  if (cluster.scores.impact >= 75) {
    angles.push({
      label: '趋势判断型',
      reason: '这条信号已经不只是单点事件，可以作为下一阶段行业节奏变化的观察口。',
    });
  }

  if (cluster.topicTags.includes('监管与治理') || cluster.topicTags.includes('资本与商业化')) {
    angles.push({
      label: '机会 / 风险型',
      reason: '它适合从机会与代价的对照切入，更容易形成明确观点。',
    });
  }

  return angles;
}

function buildBackground(cluster: ScoredAiNewsCluster) {
  const sourceNames = [
    ...new Set(cluster.signals.slice(0, 4).map((s) => s.sourceName)),
  ];

  return [
    `当前聚合 ${cluster.coverageCount} 条报道，来源包括：${sourceNames.join('、')}。`,
    cluster.officialSourceCount > 0
      ? '含官方信源，可作为写作时的第一手依据。'
      : '主要来自媒体交叉报道，建议补充官方信息确认细节。',
    cluster.bucket === 'today'
      ? `最新更新于 ${new Date(cluster.latestPublishedAt).toLocaleString('zh-CN')}，仍在时效窗口内，适合直接切入。`
      : `首报于 ${new Date(cluster.earliestPublishedAt).toLocaleString('zh-CN')}，适合做背景、影响和竞争格局延展。`,
  ];
}

function buildPerspectives(cluster: ScoredAiNewsCluster): ResearchPerspective[] {
  return cluster.signals
    .filter(
      (s) =>
        s.link !== cluster.primarySignal.link &&
        (!!s.imageUrl || !!(s.summary?.trim())),
    )
    .slice(0, 3)
    .map((s) => ({
      sourceName: s.sourceName,
      sourceType: s.sourceType,
      title: s.title,
      summary: s.summary?.trim() ?? '',
      imageUrl: s.imageUrl,
      link: s.link,
      publishedAt: s.publishedAt,
    }));
}

function buildEvidence(cluster: ScoredAiNewsCluster): ResearchEvidence[] {
  return cluster.signals.slice(0, 5).map((signal) => ({
    label: `${signal.sourceName}｜${signal.title}`,
    summary: signal.summary || '',
    sourceName: signal.sourceName,
    link: signal.link,
    imageUrl: signal.imageUrl,
    publishedAt: signal.publishedAt,
    sourceType: signal.sourceType,
  }));
}

function truncateSummary(text: string, maxLen = 200): string {
  if (text.length <= maxLen) return text;
  // 尝试在句子边界截断（。！？）
  const cutoff = text.slice(0, maxLen);
  const lastBreak = Math.max(
    cutoff.lastIndexOf('。'),
    cutoff.lastIndexOf('！'),
    cutoff.lastIndexOf('？'),
    cutoff.lastIndexOf('. '),
  );
  return lastBreak > maxLen * 0.5
    ? text.slice(0, lastBreak + 1)
    : `${cutoff.trimEnd()}……`;
}

function buildWhatHappened(cluster: ScoredAiNewsCluster): string {
  const primary = cluster.primarySignal;
  const base = `${primary.sourceName} 报道的核心事件：${primary.title}。`;
  const summaryPart = primary.summary
    ? `\n\n> ${truncateSummary(primary.summary)}`
    : '';
  const statPart = `\n\n当前已聚合 ${cluster.coverageCount} 条相关报道，最新更新于 ${new Date(cluster.latestPublishedAt).toLocaleString('zh-CN')}。`;
  return `${base}${summaryPart}${statPart}`;
}

export function buildResearchBrief(cluster: ScoredAiNewsCluster): ResearchBrief {
  const primary = cluster.primarySignal;
  const leadImageUrl =
    primary.imageUrl || cluster.signals.find((signal) => signal.imageUrl)?.imageUrl;

  return {
    candidateId: cluster.clusterId,
    title: cluster.title,
    bucket: cluster.bucket,
    imageUrl: leadImageUrl,
    articleImages: primary.articleImages,
    whatHappened: buildWhatHappened(cluster),
    whyItMatters: buildWhyItMatters(cluster),
    whoIsAffected: buildAffectedAudience(cluster),
    recommendedAngles: buildAngles(cluster),
    background: buildBackground(cluster),
    perspectives: buildPerspectives(cluster),
    evidence: buildEvidence(cluster),
    scores: cluster.scores,
    totalScore: cluster.totalScore,
  };
}

export type { ScoredAiNewsCluster, ResearchBrief };
