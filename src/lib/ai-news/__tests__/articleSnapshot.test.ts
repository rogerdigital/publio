import { describe, expect, test } from 'vitest';

import { extractArticleSnapshotFromHtml } from '@/lib/ai-news/articleSnapshot';

describe('extractArticleSnapshotFromHtml', () => {
  test('统计真实图片数时不会把默认首图伪装成 1 张', () => {
    const html = `
      <html>
        <head>
          <meta property="og:image" content="https://cdn.example.com/site-logo.png" />
        </head>
        <body>
          <article>
            <h1>一篇文章</h1>
            <p>这里只是文字，没有正文配图。</p>
          </article>
        </body>
      </html>
    `;

    const snapshot = extractArticleSnapshotFromHtml(
      html,
      'https://example.com/article/1',
    );

    expect(snapshot.imageUrl).toBe('');
    expect(snapshot.imageCount).toBeUndefined();
  });

  test('优先提取正文中的真实配图并统计去重后的数量', () => {
    const html = `
      <html>
        <head>
          <meta property="og:image" content="https://cdn.example.com/site-logo.png" />
        </head>
        <body>
          <article>
            <p>正文内容。</p>
            <img src="/images/cover-1.jpg" />
            <img src="/images/cover-2.jpg" />
            <img src="/images/cover-2.jpg" />
          </article>
        </body>
      </html>
    `;

    const snapshot = extractArticleSnapshotFromHtml(
      html,
      'https://example.com/article/1',
    );

    expect(snapshot.imageUrl).toBe('https://example.com/images/cover-1.jpg');
    expect(snapshot.imageCount).toBe(2);
  });
});
