export interface NewsDraftPayload {
  title: string;
  content: string;
}

export interface ResearchDraftSection {
  title: string;
  whyNow: string;
  whatHappened: string;
  whyItMatters: string;
  whoIsAffected: string[];
  recommendedAngles: Array<{
    label: string;
    reason: string;
  }>;
  background: string[];
  evidence: Array<{
    label: string;
    sourceName: string;
    link: string;
    publishedAt: string;
  }>;
}

export const NEWS_DRAFT_STORAGE_KEY = 'publio-ai-news-draft';

export function buildNewsArticleMarkdown(params: {
  headline: string;
  intro: string;
  sections: Array<{
    title: string;
    emoji?: string;
    deck?: string;
    summary: string;
    body?: string;
    takeaway?: string;
    source: string;
    publishedAt: string;
    link: string;
    imageUrl?: string;
  }>;
}) {
  const highlights = params.sections
    .slice(0, 3)
    .map((section, index) => `${index + 1}. ${section.title}`)
    .join('\n');

  const lines = [
    `# ${params.headline}`,
    '',
    params.intro,
    '',
    '---',
    '',
    '## 今晚值得关注的几件事',
    '',
    '过去 12 小时里，AI 行业的信息密度依然很高。从模型更新、商业化推进，到算力与平台生态变化，几条主线都在同步演进。把这些消息放在一起看，短期热度之外，真正值得看的仍然是行业节奏正在怎么变。',
    '',
    highlights,
    '',
  ];

  params.sections.forEach((section, index) => {
    const sectionTitle = `${section.emoji ? `${section.emoji} ` : ''}${String(index + 1).padStart(2, '0')}｜${section.title}`;

    lines.push(`## ${sectionTitle}`);
    lines.push('');
    if (section.deck) {
      lines.push(`${section.deck}`);
      lines.push('');
    }
    lines.push(section.summary || '原始来源未提供摘要，请结合原文补充细节。');
    lines.push('');
    if (section.imageUrl) {
      lines.push(`![${section.title}](${section.imageUrl})`);
      lines.push('');
    }
    if (section.body) {
      lines.push(section.body);
      lines.push('');
    }
    if (section.takeaway) {
      lines.push(`> 这条消息更值得注意的是：${section.takeaway}`);
      lines.push('');
    }
    lines.push(`来源：${section.source}｜时间：${section.publishedAt}`);
    lines.push('');
    lines.push(`原文链接：${section.link}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  lines.push('## 最后说几句');
  lines.push('');
  lines.push(
    '整体来看，过去 12 小时里的 AI 新闻，仍然围绕产品更新、商业化推进与底层基础设施三条主线展开。短期看，行业节奏还会继续加快；中期看，真正决定分化的，依旧是落地效率、收入能力和基础设施成本。如果继续跟下去，接下来最值得看的，还是谁能更快把能力变成真正可用、可付费、可持续的产品。',
  );

  return lines.join('\n');
}

export function buildResearchDraftMarkdown(params: {
  headline: string;
  intro: string;
  sections: ResearchDraftSection[];
}) {
  const lines = [
    `# ${params.headline}`,
    '',
    params.intro,
    '',
    '---',
    '',
  ];

  params.sections.forEach((section, index) => {
    lines.push(`## ${String(index + 1).padStart(2, '0')}｜${section.title}`);
    lines.push('');
    lines.push('### 这件事是什么');
    lines.push('');
    lines.push(section.whatHappened);
    lines.push('');
    lines.push('### 为什么重要');
    lines.push('');
    lines.push(section.whyItMatters);
    lines.push('');
    lines.push('### 影响了谁');
    lines.push('');
    section.whoIsAffected.forEach((audience) => {
      lines.push(`- ${audience}`);
    });
    lines.push('');
    lines.push('### 推荐写法');
    lines.push('');
    section.recommendedAngles.forEach((angle) => {
      lines.push(`- **${angle.label}**：${angle.reason}`);
    });
    lines.push('');
    lines.push('### 延展背景');
    lines.push('');
    section.background.forEach((entry) => {
      lines.push(`- ${entry}`);
    });
    lines.push('');
    lines.push('### 编辑判断');
    lines.push('');
    lines.push(`> ${section.whyNow}`);
    lines.push('');
    lines.push('### 原始依据');
    lines.push('');
    section.evidence.forEach((entry) => {
      lines.push(`- ${entry.label}`);
      lines.push(`  来源：${entry.sourceName}｜时间：${entry.publishedAt}`);
      lines.push(`  链接：${entry.link}`);
    });
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  lines.push('## 写作提示');
  lines.push('');
  lines.push(
    '这份底稿优先服务选题判断与二次创作，不要直接原样发布。建议先确认主角度，再补充你的观点、读者问题意识和具体案例。',
  );

  return lines.join('\n');
}
