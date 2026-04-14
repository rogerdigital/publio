export interface NewsDraftPayload {
  title: string;
  content: string;
}

export interface ResearchDraftSection {
  title: string;
  imageUrl?: string;
  articleImages?: string[];
  whyNow: string;
  whatHappened: string;
  whyItMatters: string;
  whoIsAffected: string[];
  recommendedAngles: Array<{
    label: string;
    reason: string;
  }>;
  background: string[];
  perspectives?: Array<{
    sourceName: string;
    title: string;
    summary: string;
    imageUrl?: string;
    link: string;
    publishedAt: string;
  }>;
  evidence: Array<{
    label: string;
    sourceName: string;
    link: string;
    publishedAt: string;
  }>;
}

export const NEWS_DRAFT_STORAGE_KEY = 'publio-ai-news-draft';

export function buildResearchDraftMarkdown(params: {
  headline: string;
  intro: string;
  sections: ResearchDraftSection[];
}) {
  const lines = [
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

    // 原文配图：优先用文章内所有图，fallback 到单张 imageUrl
    const images =
      section.articleImages && section.articleImages.length > 0
        ? section.articleImages
        : section.imageUrl
          ? [section.imageUrl]
          : [];
    images.forEach((url) => {
      lines.push(`![](${url})`);
      lines.push('');
    });

    // 其他来源的报道视角（摘要 + 配图）
    if (section.perspectives && section.perspectives.length > 0) {
      section.perspectives.forEach((p) => {
        lines.push(`**${p.sourceName}** 报道：${p.title}`);
        lines.push('');
        if (p.summary) {
          lines.push(`> ${p.summary}`);
          lines.push('');
        }
        if (p.imageUrl) {
          lines.push(`![](${p.imageUrl})`);
          lines.push('');
        }
      });
    }

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
      lines.push(`- ${entry.label}｜${entry.publishedAt}`);
      lines.push(`  ${entry.link}`);
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
