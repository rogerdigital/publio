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
  const lines = [
    `# ${params.headline}`,
    '',
    '> AI Daily Wire',
    '',
    params.intro,
    '',
    '---',
    '',
    '## 开篇导读',
    '',
    '过去 12 小时里，AI 行业的信息密度依然很高。从模型更新、商业化推进，到算力与平台生态变化，几条主线都在同步演进。下面这份内容已经整理成接近公众号快讯长文的结构，你可以直接在此基础上补充观点和判断。',
    '',
  ];

  params.sections.forEach((section, index) => {
    const sectionTitle = `${section.emoji ? `${section.emoji} ` : ''}${index + 1}. ${section.title}`;

    lines.push(`## ${sectionTitle}`);
    lines.push('');
    if (section.deck) {
      lines.push(`**一句话看点：** ${section.deck}`);
      lines.push('');
    }
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
      lines.push(`> 编辑点评：${section.takeaway}`);
      lines.push('');
    }
    lines.push(`- 来源：${section.source}`);
    lines.push(`- 时间：${section.publishedAt}`);
    lines.push(`- 原文：${section.link}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  lines.push('## 值得关注');
  lines.push('');
  lines.push(
    '从这组消息来看，过去 12 小时里 AI 行业的变化依旧集中在产品上新、商业化推进与算力基础设施几条主线。对内容团队来说，这些动态既适合整理成公众号快讯，也适合继续延展成深度选题。',
  );
  lines.push('');
  lines.push('## 结语');
  lines.push('');
  lines.push(
    '如果你准备把这篇内容发到公众号或知乎，建议继续补上一段总判断：这些变化会如何影响行业竞争格局、用户心智与下一阶段的市场机会。这样整篇内容会更像一篇完整的行业快讯，而不只是新闻摘录。',
  );

  return lines.join('\n');
}
