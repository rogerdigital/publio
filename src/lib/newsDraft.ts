export interface NewsDraftPayload {
  title: string;
  content: string;
}

export const NEWS_DRAFT_STORAGE_KEY = 'publio-ai-news-draft';

export function buildNewsArticleMarkdown(params: {
  headline: string;
  intro: string;
  sections: Array<{
    title: string;
    summary: string;
    body?: string;
    takeaway?: string;
    source: string;
    publishedAt: string;
    link: string;
    imageUrl?: string;
  }>;
}) {
  const lines = [
    `# ${params.headline}`,
    '',
    params.intro,
    '',
  ];

  params.sections.forEach((section, index) => {
    lines.push(`## ${index + 1}. ${section.title}`);
    lines.push('');
    if (section.imageUrl) {
      lines.push(`![${section.title}](${section.imageUrl})`);
      lines.push('');
    }
    lines.push(section.summary);
    lines.push('');
    if (section.body) {
      lines.push(section.body);
      lines.push('');
    }
    if (section.takeaway) {
      lines.push(`> ${section.takeaway}`);
      lines.push('');
    }
    lines.push(`- 来源：${section.source}`);
    lines.push(`- 时间：${section.publishedAt}`);
    lines.push(`- 原文：${section.link}`);
    lines.push('');
  });

  lines.push('## 值得关注');
  lines.push('');
  lines.push(
    '从这组消息来看，过去 12 小时里 AI 行业的变化依旧集中在产品上新、商业化推进与算力基础设施几条主线。对内容团队来说，这些动态既适合整理成公众号快讯，也适合继续延展成深度选题。',
  );

  return lines.join('\n');
}
