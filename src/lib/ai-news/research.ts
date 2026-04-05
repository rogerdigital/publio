import type {
  ResearchBrief,
  ResearchEvidence,
  ResearchAngle,
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

  return `这不是一条普通动态，因为它直接关系到 ${impactObject}。结合当前 ${topicHeadline(cluster.topicTags)} 的主线，这个话题既有行业影响，也具备被中文内容场继续放大的条件。`;
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
  return [
    `最近 ${cluster.coverageCount} 条相关报道都指向同一主线：${topicHeadline(cluster.topicTags)}。`,
    cluster.officialSourceCount > 0
      ? '当前候选包含官方源，可作为后续写作时的第一手依据。'
      : '当前候选主要来自媒体交叉报道，适合继续补官方信息确认细节。',
    cluster.bucket === 'today'
      ? '它仍然处于今天可以直接切入的时效窗口。'
      : '它已经过了最早爆点，更适合做背景、影响和竞争格局延展。',
  ];
}

function buildEvidence(cluster: ScoredAiNewsCluster): ResearchEvidence[] {
  return cluster.signals.slice(0, 5).map((signal) => ({
    label: `${signal.sourceName}｜${signal.title}`,
    sourceName: signal.sourceName,
    link: signal.link,
    imageUrl: signal.imageUrl,
    publishedAt: signal.publishedAt,
    sourceType: signal.sourceType,
  }));
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
    whatHappened: `${primary.sourceName} 指向的核心事件是：${primary.title}。当前候选窗口内共聚合 ${cluster.coverageCount} 条相关报道，最新更新发生在 ${new Date(cluster.latestPublishedAt).toLocaleString('zh-CN')}。`,
    whyItMatters: buildWhyItMatters(cluster),
    whoIsAffected: buildAffectedAudience(cluster),
    recommendedAngles: buildAngles(cluster),
    background: buildBackground(cluster),
    evidence: buildEvidence(cluster),
    scores: cluster.scores,
    totalScore: cluster.totalScore,
  };
}

export type { ScoredAiNewsCluster, ResearchBrief };
