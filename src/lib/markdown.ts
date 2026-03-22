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
      'max-width:580px;margin:0 auto;padding:0 10px 48px;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;color:#e8ddd2;line-height:1.95;letter-spacing:0.02em;',
    lead:
      'margin:0 0 24px;padding:18px 18px 0;border-radius:0;background:transparent;border:none;font-size:17px;line-height:1.95;color:#f2e9df;',
    paragraph: 'margin:16px 0;font-size:16px;line-height:1.95;color:#ddd0c4;',
    heading2:
      'margin:38px 0 16px;font-size:27px;line-height:1.45;font-weight:800;color:#fff4ea;',
    heading3:
      'margin:28px 0 12px;padding-left:14px;border-left:3px solid #d46f3d;font-size:21px;line-height:1.6;font-weight:700;color:#fff0e3;',
    blockquote:
      'margin:18px 0;padding:16px 18px;border-radius:16px;background:#211d1a;border:1px solid #3a312c;color:#f0dfd0;font-size:15px;line-height:1.9;',
    list: 'margin:16px 0 16px 1.15em;padding:0;color:#f0dfd0;',
    listItem: 'margin:8px 0;font-size:15px;line-height:1.9;',
    image:
      'display:block;width:100%;margin:24px auto;border-radius:18px;overflow:hidden;border:1px solid #433831;',
    divider:
      'margin:30px auto;border:none;border-top:1px dashed #4b4038;max-width:100%;',
    meta: 'margin:12px 0;font-size:14px;line-height:1.9;color:#b8a799;',
    link: 'color:#ff9160;text-decoration:none;border-bottom:1px solid rgba(255,145,96,0.28);',
    code: 'padding:2px 6px;border-radius:8px;background:#2a221e;color:#ffb089;font-size:0.92em;',
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
    <section style="position:relative;overflow:hidden;margin:0 0 28px;padding:18px;border-radius:26px;background:linear-gradient(180deg,#1b1a19 0%,#181715 100%);border:1px solid #2d2926;box-shadow:0 22px 48px rgba(10,10,10,0.26);">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at top left,rgba(201,102,53,0.26),transparent 32%),radial-gradient(circle at bottom right,rgba(255,255,255,0.05),transparent 26%);"></div>
      <div style="position:relative;padding:34px 30px;border-radius:22px;background:linear-gradient(135deg,#5a3427 0%,#2b221d 54%,#181716 100%);">
      <div style="position:relative;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.32em;text-transform:uppercase;color:#ff9a67;">AI Daily Wire</p>
        <h1 style="margin:0;font-size:38px;line-height:1.32;font-weight:800;color:#fff4e8;">${escapeHtml(title)}</h1>
      </div>
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
