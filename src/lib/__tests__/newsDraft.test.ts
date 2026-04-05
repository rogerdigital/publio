import { describe, expect, test } from 'vitest';

import { buildResearchDraftMarkdown } from '@/lib/newsDraft';

describe('buildResearchDraftMarkdown', () => {
  test('有原文配图时会把图片写进研究底稿 markdown', () => {
    const markdown = buildResearchDraftMarkdown({
      headline: 'AI 研究底稿',
      intro: '这里是一份研究底稿。',
      sections: [
        {
          title: 'OpenAI 发布新模型 GPT-X',
          imageUrl: 'https://openai.com/images/gpt-x-cover.jpg',
          whyNow: '这条题今天有明显传播势能。',
          whatHappened: 'OpenAI 发布了 GPT-X。',
          whyItMatters: '它影响模型能力竞争。',
          whoIsAffected: ['模型厂商', '开发者'],
          recommendedAngles: [
            {
              label: '新闻解读型',
              reason: '适合快速解释发生了什么。',
            },
          ],
          background: ['最近模型竞赛继续升温。'],
          evidence: [
            {
              label: 'OpenAI｜OpenAI 发布新模型 GPT-X',
              sourceName: 'OpenAI',
              link: 'https://openai.com/blog/gpt-x',
              publishedAt: '2026-04-05 16:00',
            },
          ],
        },
      ],
    });

    expect(markdown).toContain(
      '![OpenAI 发布新模型 GPT-X](https://openai.com/images/gpt-x-cover.jpg)',
    );
  });
});
