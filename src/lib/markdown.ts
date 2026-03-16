import { marked, Tokens } from 'marked';

type StyledPlatform = 'wechat' | 'zhihu';

const ARTICLE_THEME: Record<
  StyledPlatform,
  {
    article: string;
    lead: string;
    paragraph: string;
    heading2: string;
    heading3: string;
    blockquote: string;
    list: string;
    listItem: string;
    image: string;
    divider: string;
    meta: string;
    link: string;
    code: string;
  }
> = {
  wechat: {
    article:
      'max-width:720px;margin:0 auto;padding:0 6px;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;color:#2a2927;line-height:1.9;letter-spacing:0.02em;',
    lead:
      'margin:0 0 26px;padding:20px 22px;border-radius:18px;background:linear-gradient(180deg,#fff7f2 0%,#fff 100%);border:1px solid #f1d7c7;font-size:17px;line-height:1.95;color:#4b4036;',
    paragraph: 'margin:18px 0;font-size:16px;line-height:1.95;color:#35312d;',
    heading2:
      'margin:40px 0 16px;font-size:28px;line-height:1.45;font-weight:800;color:#1f1c19;',
    heading3:
      'margin:28px 0 12px;padding-left:14px;border-left:4px solid #ef6b38;font-size:22px;line-height:1.6;font-weight:700;color:#28231f;',
    blockquote:
      'margin:20px 0;padding:16px 18px;border-radius:16px;background:#fff5ef;border:1px solid #f4d8ca;color:#6e5648;font-size:15px;line-height:1.9;',
    list: 'margin:18px 0 18px 1.2em;padding:0;color:#35312d;',
    listItem: 'margin:8px 0;font-size:15px;line-height:1.9;',
    image:
      'display:block;width:100%;margin:24px auto;border-radius:22px;overflow:hidden;border:1px solid #eee3da;',
    divider:
      'margin:34px auto;border:none;border-top:1px dashed #d8c8bc;max-width:100%;',
    meta: 'margin:12px 0;font-size:14px;line-height:1.9;color:#857668;',
    link: 'color:#d95e2f;text-decoration:none;border-bottom:1px solid rgba(217,94,47,0.25);',
    code: 'padding:2px 6px;border-radius:8px;background:#f5eee9;color:#8a4a2f;font-size:0.92em;',
  },
  zhihu: {
    article:
      'max-width:760px;margin:0 auto;padding:0 8px;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;color:#1f2329;line-height:1.9;',
    lead:
      'margin:0 0 24px;padding:18px 20px;border-radius:16px;background:#f8f9fb;border:1px solid #e6e8eb;font-size:17px;line-height:1.9;color:#39414a;',
    paragraph: 'margin:18px 0;font-size:16px;line-height:1.95;color:#2d333a;',
    heading2:
      'margin:38px 0 14px;font-size:28px;line-height:1.45;font-weight:800;color:#101418;',
    heading3:
      'margin:26px 0 12px;padding-left:12px;border-left:4px solid #ff6b35;font-size:21px;line-height:1.6;font-weight:700;color:#17202a;',
    blockquote:
      'margin:20px 0;padding:14px 16px;border-radius:14px;background:#f7f7f8;border:1px solid #eceef0;color:#52606d;font-size:15px;line-height:1.9;',
    list: 'margin:18px 0 18px 1.2em;padding:0;color:#2d333a;',
    listItem: 'margin:8px 0;font-size:15px;line-height:1.9;',
    image:
      'display:block;width:100%;margin:24px auto;border-radius:20px;overflow:hidden;border:1px solid #ececec;',
    divider:
      'margin:32px auto;border:none;border-top:1px dashed #d8dde3;max-width:100%;',
    meta: 'margin:12px 0;font-size:14px;line-height:1.9;color:#6b7280;',
    link: 'color:#175199;text-decoration:none;border-bottom:1px solid rgba(23,81,153,0.22);',
    code: 'padding:2px 6px;border-radius:8px;background:#f3f4f6;color:#b54708;font-size:0.92em;',
  },
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanInlineText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

type TokensList = any[];

function renderInline(
  tokens: any[] | undefined,
  platform?: StyledPlatform,
): string {
  if (!tokens || tokens.length === 0) {
    return '';
  }

  const theme = platform ? ARTICLE_THEME[platform] : null;

  return tokens
    .map((token) => {
      switch (token.type) {
        case 'text':
        case 'escape':
          return escapeHtml(token.raw);
        case 'strong':
          return `<strong style="font-weight:700;color:${platform === 'wechat' ? '#1f1c19' : '#111827'};">${renderInline(token.tokens, platform)}</strong>`;
        case 'em':
          return `<em style="font-style:italic;">${renderInline(token.tokens, platform)}</em>`;
        case 'codespan':
          return `<code style="${theme?.code ?? ''}">${escapeHtml(token.text)}</code>`;
        case 'del':
          return `<span style="text-decoration:line-through;opacity:0.75;">${renderInline(token.tokens, platform)}</span>`;
        case 'link':
          return `<a href="${escapeHtml(token.href)}" style="${theme?.link ?? ''}" target="_blank" rel="noreferrer">${renderInline(token.tokens, platform) || escapeHtml(token.text)}</a>`;
        case 'image':
          return token.href
            ? `<span style="${theme?.image ?? ''}"><img src="${escapeHtml(token.href)}" alt="${escapeHtml(token.text || '')}" style="display:block;width:100%;height:auto;" /></span>`
            : '';
        case 'br':
          return '<br />';
        default:
          return 'raw' in token ? escapeHtml(token.raw) : '';
      }
    })
    .join('');
}

function tokensToHtml(
  tokens: TokensList,
  platform?: StyledPlatform,
  options?: { skipFirstH1?: boolean },
): string {
  const theme = platform ? ARTICLE_THEME[platform] : null;
  const skipFirstH1 = options?.skipFirstH1 ?? false;
  let firstH1Skipped = false;

  return tokens
    .map((token) => {
      switch (token.type) {
        case 'heading': {
          const inner = renderInline(token.tokens, platform);

          if (token.depth === 1) {
            if (skipFirstH1 && !firstH1Skipped) {
              firstH1Skipped = true;
              return '';
            }

            return `<h2 style="${theme?.heading2 ?? ''}">${inner}</h2>`;
          }

          if (token.depth === 2) {
            return `<h2 style="${theme?.heading2 ?? ''}">${inner}</h2>`;
          }

          return `<h3 style="${theme?.heading3 ?? ''}">${inner}</h3>`;
        }
        case 'paragraph': {
          const inner = renderInline(token.tokens, platform);
          return `<p style="${theme?.paragraph ?? ''}">${inner}</p>`;
        }
        case 'space':
          return '';
        case 'blockquote': {
          const inner = tokensToHtml(token.tokens, platform);
          return `<blockquote style="${theme?.blockquote ?? ''}">${inner}</blockquote>`;
        }
        case 'list': {
          const items = token.items
            .map((item: Tokens.ListItem) => {
              const body = tokensToHtml(item.tokens, platform);
              return `<li style="${theme?.listItem ?? ''}">${body}</li>`;
            })
            .join('');
          const tagName = token.ordered ? 'ol' : 'ul';
          return `<${tagName} style="${theme?.list ?? ''}">${items}</${tagName}>`;
        }
        case 'hr':
          return `<hr style="${theme?.divider ?? ''}" />`;
        case 'code':
          return `<pre style="margin:22px 0;padding:16px 18px;border-radius:16px;background:#111827;color:#f9fafb;overflow:auto;"><code>${escapeHtml(token.text)}</code></pre>`;
        case 'html':
          return token.text;
        default:
          return '';
      }
    })
    .join('');
}

function tokenize(markdown: string) {
  return marked.lexer(markdown) as unknown as TokensList;
}

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}

export function markdownToStyledHtml(
  title: string,
  markdown: string,
  platform: StyledPlatform,
): string {
  const tokens = tokenize(markdown);
  const hasLeadingTitle =
    tokens[0]?.type === 'heading' &&
    (tokens[0] as Tokens.Heading).depth === 1 &&
    cleanInlineText((tokens[0] as Tokens.Heading).text) === cleanInlineText(title);

  const contentTokens = hasLeadingTitle ? tokens.slice(1) : tokens;
  const leadIndex = contentTokens.findIndex((token) => token.type === 'paragraph');
  const leadToken =
    leadIndex >= 0 ? (contentTokens[leadIndex] as Tokens.Paragraph) : null;
  const leadHtml = leadToken
    ? `<section style="${ARTICLE_THEME[platform].lead}">${renderInline(leadToken.tokens, platform)}</section>`
    : '';
  const bodyTokens =
    leadIndex >= 0
      ? contentTokens.filter((_, index) => index !== leadIndex)
      : contentTokens;

  const hero = `
    <section style="position:relative;overflow:hidden;margin:0 0 30px;padding:34px 28px;border-radius:28px;background:linear-gradient(135deg,#1b1a18 0%,#2b211b 48%,#151515 100%);">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at top left,rgba(255,122,69,0.35),transparent 32%),radial-gradient(circle at bottom right,rgba(255,255,255,0.08),transparent 28%);"></div>
      <div style="position:relative;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.32em;text-transform:uppercase;color:#ff9a67;">AI Daily Wire</p>
        <h1 style="margin:0;font-size:38px;line-height:1.32;font-weight:800;color:#fff4e8;">${escapeHtml(title)}</h1>
      </div>
    </section>
  `;

  const bodyHtml = tokensToHtml(bodyTokens, platform, { skipFirstH1: true });

  return `
    <article style="${ARTICLE_THEME[platform].article}">
      ${hero}
      ${leadHtml}
      ${bodyHtml}
    </article>
  `;
}

export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
