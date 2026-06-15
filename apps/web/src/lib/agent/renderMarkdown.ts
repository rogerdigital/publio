import { marked, Tokens } from 'marked';
import sanitizeHtml from 'sanitize-html';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInline(tokens: Tokens.Generic[] | undefined): string {
  if (!tokens || tokens.length === 0) return '';
  return tokens
    .map((token) => {
      switch (token.type) {
        case 'text':
        case 'escape':
          return escapeHtml(token.raw);
        case 'strong':
          return `<strong>${renderInline(token.tokens)}</strong>`;
        case 'em':
          return `<em>${renderInline(token.tokens)}</em>`;
        case 'codespan':
          return `<code>${escapeHtml(token.text)}</code>`;
        case 'del':
          return `<del>${renderInline(token.tokens)}</del>`;
        case 'link':
          return `<a href="${escapeHtml(token.href)}" target="_blank" rel="noreferrer">${renderInline(token.tokens) || escapeHtml(token.text)}</a>`;
        case 'image':
          return `<img src="${escapeHtml(token.href)}" alt="${escapeHtml(token.text || '')}" />`;
        case 'br':
          return '<br />';
        default:
          return 'raw' in token ? escapeHtml(token.raw) : '';
      }
    })
    .join('');
}

function tokensToHtml(tokens: Tokens.Generic[]): string {
  return tokens
    .map((token) => {
      switch (token.type) {
        case 'heading': {
          const inner = renderInline(token.tokens);
          const tag = `h${Math.min(token.depth, 4)}`;
          return `<${tag}>${inner}</${tag}>`;
        }
        case 'paragraph':
          return `<p>${renderInline(token.tokens)}</p>`;
        case 'text':
          return `<p>${token.tokens ? renderInline(token.tokens) : escapeHtml(token.raw ?? '')}</p>`;
        case 'space':
          return '';
        case 'blockquote':
          return `<blockquote>${tokensToHtml(token.tokens as Tokens.Generic[])}</blockquote>`;
        case 'list': {
          const items = token.items
            .map((item: Tokens.ListItem) => `<li>${tokensToHtml(item.tokens)}</li>`)
            .join('');
          return token.ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
        }
        case 'hr':
          return '<hr />';
        case 'code':
          return `<pre><code>${escapeHtml(token.text)}</code></pre>`;
        case 'html':
          return escapeHtml(token.text);
        default:
          return '';
      }
    })
    .join('');
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'del']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['style'],
    img: ['src', 'alt'],
    a: ['href', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

export function renderAgentMarkdown(markdown: string): string {
  const tokens = marked.lexer(markdown) as unknown as Tokens.Generic[];
  const raw = tokensToHtml(tokens);
  return sanitizeHtml(raw, SANITIZE_OPTIONS);
}
