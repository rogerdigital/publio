interface ArticleSnapshot {
  imageUrl: string;
  imageUrls: string[];
  wordCount?: number;
  imageCount?: number;
}

function resolveUrl(rawUrl: string, baseUrl?: string) {
  const normalized = rawUrl.trim();

  if (!normalized || normalized.startsWith('data:')) {
    return '';
  }

  try {
    return new URL(normalized, baseUrl).toString();
  } catch {
    return '';
  }
}

function stripHtml(value: string) {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMainScope(html: string) {
  return (
    html.match(/<article\b[\s\S]*?<\/article>/i)?.[0] ||
    html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ||
    html.match(/<body\b[\s\S]*?<\/body>/i)?.[0] ||
    html
  );
}

function isLikelyDecorativeImage(url: string) {
  const normalized = url.toLowerCase();

  if (!normalized) {
    return true;
  }

  // WordPress 主题资源目录
  if (/\/wp-content\/themes\//i.test(normalized)) {
    return true;
  }

  return (
    normalized.endsWith('.svg') ||
    /(logo|favicon|avatar|icon|sprite|placeholder|default|qrcode|qr-code|apple-touch-icon|siteicon|site-logo)/i.test(
      normalized,
    )
  );
}

function extractImageCandidates(scope: string, pageUrl: string) {
  const imageMatches = Array.from(scope.matchAll(/<img\b[^>]*>/gi));
  const images = imageMatches
    .map((match) => {
      const tag = match[0];
      const sourceMatch =
        tag.match(/\s(?:src|data-src|data-original|data-url)=["']([^"']+)["']/i) || null;
      return sourceMatch ? resolveUrl(sourceMatch[1], pageUrl) : '';
    })
    .filter((url) => url && !isLikelyDecorativeImage(url));

  return Array.from(new Set(images));
}

function extractMetaImage(html: string, pageUrl: string) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match?.[1]) {
      continue;
    }

    const imageUrl = resolveUrl(match[1], pageUrl);
    if (imageUrl && !isLikelyDecorativeImage(imageUrl)) {
      return imageUrl;
    }
  }

  return '';
}

function countArticleWords(scope: string) {
  const text = stripHtml(scope);

  if (!text) {
    return undefined;
  }

  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const latinTokens = text
    .replace(/[\u4e00-\u9fff]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const total = chineseChars + latinTokens;

  return total > 0 ? total : undefined;
}

export function extractArticleSnapshotFromHtml(
  html: string,
  pageUrl: string,
): ArticleSnapshot {
  const scope = extractMainScope(html);
  const images = extractImageCandidates(scope, pageUrl);
  const metaImage = extractMetaImage(html, pageUrl);
  const imageUrls = images.length > 0 ? images : (metaImage ? [metaImage] : []);

  return {
    imageUrl: imageUrls[0] ?? '',
    imageUrls,
    wordCount: countArticleWords(scope),
    imageCount: images.length > 0 ? images.length : undefined,
  };
}

export async function fetchArticleSnapshot(link: string): Promise<ArticleSnapshot> {
  try {
    const response = await fetch(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PublioBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { imageUrl: '', imageUrls: [] };
    }

    const html = await response.text();
    return extractArticleSnapshotFromHtml(html, link);
  } catch {
    return { imageUrl: '', imageUrls: [] };
  }
}

export type { ArticleSnapshot };
