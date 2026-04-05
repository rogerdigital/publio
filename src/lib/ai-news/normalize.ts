import { createHash } from 'node:crypto';

import type { AiNewsSource, NormalizedAiNewsSignal } from '@/lib/ai-news/types';

const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'into',
  'after',
  'about',
  'open',
  'will',
  'that',
  'this',
  '推出',
  '发布',
  '宣布',
  '公布',
  '最新',
  '公司',
  '模型',
  '人工智能',
  'ai',
  'llm',
]);

export function decodeHtmlEntities(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function stripHtml(value: string) {
  return decodeHtmlEntities(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanNewsText(value: string, sourceName?: string) {
  let text = stripHtml(value)
    .replace(/\s*[|｜丨]\s*[^|｜丨]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (sourceName) {
    const escapedSource = sourceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text
      .replace(new RegExp(`\\s*-?\\s*${escapedSource}$`, 'i'), '')
      .replace(new RegExp(`\\s+${escapedSource}$`, 'i'), '')
      .trim();
  }

  return text;
}

export function hasChinese(text: string) {
  return /[\u4e00-\u9fff]/.test(text);
}

export function extractTagValue(block: string, tagName: string) {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'i'));
  return match ? decodeHtmlEntities(match[1].trim()) : '';
}

export function extractLink(block: string) {
  const contentLink = extractTagValue(block, 'link');
  if (contentLink.startsWith('http')) {
    return contentLink;
  }

  const hrefMatch = block.match(/<link[^>]+href="([^"]+)"/i);
  return hrefMatch ? decodeHtmlEntities(hrefMatch[1]) : '';
}

function resolveUrl(rawUrl: string, baseUrl?: string) {
  const normalized = decodeHtmlEntities(rawUrl).trim();

  if (!normalized) {
    return '';
  }

  try {
    return new URL(normalized, baseUrl).toString();
  } catch {
    return '';
  }
}

function extractImageFromDescription(block: string, pageUrl?: string) {
  const description = extractTagValue(block, 'description');
  const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i);
  return imgMatch ? resolveUrl(imgMatch[1], pageUrl) : '';
}

export function extractContentImage(block: string, pageUrl?: string) {
  const mediaContentMatch = block.match(
    /<media:content[^>]+url="([^"]+)"[^>]*?(?:type="image\/[^"]+")?[^>]*\/?>/i,
  );
  if (mediaContentMatch) {
    return resolveUrl(mediaContentMatch[1], pageUrl);
  }

  const mediaThumbnailMatch = block.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
  if (mediaThumbnailMatch) {
    return resolveUrl(mediaThumbnailMatch[1], pageUrl);
  }

  const enclosureMatch = block.match(
    /<enclosure[^>]+url="([^"]+)"[^>]+type="image\/[^"]+"/i,
  );
  if (enclosureMatch) {
    return resolveUrl(enclosureMatch[1], pageUrl);
  }

  return extractImageFromDescription(block, pageUrl);
}

export function extractItems(xml: string) {
  const itemMatches = xml.match(/<item\b[\s\S]*?<\/item>/gi);
  if (itemMatches && itemMatches.length > 0) {
    return itemMatches;
  }

  return xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
}

export function normalizeCanonicalTitle(title: string) {
  return stripHtml(title)
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseSourceLabel(rawTitle: string, fallbackSource: string) {
  const titleParts = rawTitle.split(/\s+-\s+/);
  if (titleParts.length > 1) {
    return titleParts[titleParts.length - 1].trim() || fallbackSource;
  }

  return fallbackSource;
}

export function normalizeNewsTitle(rawTitle: string) {
  const titleParts = stripHtml(rawTitle).split(/\s+-\s+/);
  if (titleParts.length > 1) {
    return titleParts.slice(0, -1).join(' - ').trim();
  }

  return stripHtml(rawTitle);
}

export function inferTopicTags(title: string, summary: string) {
  const text = `${title} ${summary}`.toLowerCase();
  const topics = new Set<string>();

  if (/(芯片|gpu|英伟达|算力|nvidia)/i.test(text)) {
    topics.add('算力与芯片');
  }
  if (/(融资|估值|募资|收购|财报|营收|订阅|企业客户|收入)/i.test(text)) {
    topics.add('资本与商业化');
  }
  if (/(发布|上线|推出|开源|模型|agent|智能体|应用|api)/i.test(text)) {
    topics.add('模型与产品发布');
  }
  if (/(监管|政策|安全|版权|法案|合规|审查)/i.test(text)) {
    topics.add('监管与治理');
  }

  if (topics.size === 0) {
    topics.add('行业动态');
  }

  return Array.from(topics);
}

export function extractEntityTokens(title: string, summary: string) {
  return Array.from(
    new Set(
      normalizeCanonicalTitle(`${title} ${summary}`)
        .split(/\s+/)
        .filter((token) => token.length >= 2 && !STOPWORDS.has(token)),
    ),
  ).slice(0, 12);
}

export function readSourceDomain(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function createSignalId(link: string, title: string) {
  return createHash('sha1').update(`${link}::${title}`).digest('hex').slice(0, 12);
}

export function normalizeAiNewsSignal(params: {
  title: string;
  summary: string;
  link: string;
  imageUrl?: string;
  publishedAt: string;
  fetchedAt: string;
  sourceName: string;
  sourceType: AiNewsSource['sourceType'];
  isOfficialSource: boolean;
}): NormalizedAiNewsSignal | null {
  const title = normalizeNewsTitle(params.title);
  const summary = cleanNewsText(params.summary, params.sourceName);
  const publishedTimestamp = Date.parse(params.publishedAt);

  if (!title || !params.link || !Number.isFinite(publishedTimestamp)) {
    return null;
  }

  const publishedAt = new Date(publishedTimestamp).toISOString();

  const combined = `${title} ${summary}`;
  if (!hasChinese(combined) && !/\b(ai|openai|anthropic|nvidia|deepmind|meta)\b/i.test(combined)) {
    return null;
  }

  return {
    id: createSignalId(params.link, title),
    title,
    canonicalTitle: normalizeCanonicalTitle(title),
    summary,
    link: params.link,
    imageUrl: params.imageUrl,
    sourceName: params.sourceName,
    sourceType: params.sourceType,
    sourceDomain: readSourceDomain(params.link),
    publishedAt,
    fetchedAt: params.fetchedAt,
    entityTokens: extractEntityTokens(title, summary),
    topicTags: inferTopicTags(title, summary),
    isOfficialSource: params.isOfficialSource,
  };
}
