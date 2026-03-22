export interface AiNewsItem {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string;
  score: number;
  topic: string;
  emoji: string;
  deck: string;
  body: string;
  takeaway: string;
  imageUrl?: string;
}

export interface AiNewsBrief {
  title: string;
  summary: string;
  relatedTitles: string[];
}

interface NewsSource {
  name: string;
  url: string;
  weight: number;
}

const RSS_SOURCES: NewsSource[] = [
  {
    name: 'Google News AI',
    url:
      'https://news.google.com/rss/search?q=%28AI+OR+%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD+OR+%E5%A4%A7%E6%A8%A1%E5%9E%8B+OR+OpenAI+OR+DeepSeek+OR+%E8%8B%B1%E4%BC%9F%E8%BE%BE%29+when%3A12h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    weight: 3,
  },
  {
    name: 'Google News 大模型',
    url:
      'https://news.google.com/rss/search?q=%28%E5%A4%A7%E6%A8%A1%E5%9E%8B+OR+LLM+OR+%E7%94%9F%E6%88%90%E5%BC%8FAI+OR+%E6%99%BA%E8%83%BD%E4%BD%93%29+when%3A12h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    weight: 2,
  },
  {
    name: 'Google News 厂商动态',
    url:
      'https://news.google.com/rss/search?q=%28OpenAI+OR+Anthropic+OR+Google+DeepMind+OR+Meta+OR+DeepSeek+OR+%E9%98%BF%E9%87%8C+OR+%E8%85%BE%E8%AE%AF+OR+%E7%99%BE%E5%BA%A6%29+when%3A12h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    weight: 2,
  },
  {
    name: 'Google News AI 芯片',
    url:
      'https://news.google.com/rss/search?q=%28AI%E8%8A%AF%E7%89%87+OR+%E8%8B%B1%E4%BC%9F%E8%BE%BE+OR+GPU+OR+%E7%AE%97%E5%8A%9B%29+when%3A12h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    weight: 2,
  },
];

const AI_KEYWORDS = [
  'ai',
  'artificial intelligence',
  'openai',
  'anthropic',
  'deepmind',
  'nvidia',
  'google',
  'microsoft',
  'meta',
  'xai',
  'llm',
  'agent',
  'model',
  'inference',
  'chip',
  'gpu',
];

function decodeHtmlEntities(value: string) {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(value: string) {
  return decodeHtmlEntities(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanNewsText(value: string, source?: string) {
  let text = stripHtml(value)
    .replace(/\s*[|｜丨]\s*[^|｜丨]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (source) {
    const escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text
      .replace(new RegExp(`\\s*-?\\s*${escapedSource}$`, 'i'), '')
      .replace(new RegExp(`\\s+${escapedSource}$`, 'i'), '')
      .trim();
  }

  return text;
}

function hasChinese(text: string) {
  return /[\u4e00-\u9fff]/.test(text);
}

function extractTagValue(block: string, tagName: string) {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'i'));
  return match ? decodeHtmlEntities(match[1].trim()) : '';
}

function extractLink(block: string) {
  const contentLink = extractTagValue(block, 'link');
  if (contentLink.startsWith('http')) {
    return contentLink;
  }

  const hrefMatch = block.match(/<link[^>]+href="([^"]+)"/i);
  return hrefMatch ? decodeHtmlEntities(hrefMatch[1]) : '';
}

function extractItems(xml: string) {
  const itemMatches = xml.match(/<item\b[\s\S]*?<\/item>/gi);
  if (itemMatches && itemMatches.length > 0) {
    return itemMatches;
  }

  return xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
}

function scoreNewsItem(
  item: Pick<AiNewsItem, 'title' | 'summary' | 'publishedAt'>,
  sourceWeight: number,
) {
  const combinedText = `${item.title} ${item.summary}`.toLowerCase();
  const keywordScore = AI_KEYWORDS.reduce((score, keyword) => {
    return combinedText.includes(keyword) ? score + 1 : score;
  }, 0);

  const publishedTime = new Date(item.publishedAt).getTime();
  const ageHours = Math.max(0, (Date.now() - publishedTime) / (1000 * 60 * 60));
  const recencyScore = Math.max(0, 12 - ageHours);

  return Number((keywordScore * 2 + recencyScore + sourceWeight * 3).toFixed(2));
}

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function parseSourceLabel(rawTitle: string, fallbackSource: string) {
  const titleParts = rawTitle.split(/\s+-\s+/);
  if (titleParts.length > 1) {
    return titleParts[titleParts.length - 1].trim() || fallbackSource;
  }

  return fallbackSource;
}

function normalizeNewsTitle(rawTitle: string) {
  const titleParts = stripHtml(rawTitle).split(/\s+-\s+/);
  if (titleParts.length > 1) {
    return titleParts.slice(0, -1).join(' - ').trim();
  }

  return stripHtml(rawTitle);
}

function inferTopic(title: string, summary: string) {
  const text = `${title} ${summary}`.toLowerCase();

  if (/(芯片|gpu|英伟达|算力|nvidia)/i.test(text)) {
    return '算力与芯片';
  }
  if (/(融资|估值|募资|收购|财报|营收)/i.test(text)) {
    return '资本与商业化';
  }
  if (/(发布|上线|推出|开源|模型|agent|智能体|应用)/i.test(text)) {
    return '模型与产品发布';
  }
  if (/(监管|政策|安全|版权|法案|合规)/i.test(text)) {
    return '监管与治理';
  }

  return '行业动态';
}

function topicEmoji(topic: string) {
  switch (topic) {
    case '算力与芯片':
      return '🧠';
    case '资本与商业化':
      return '💰';
    case '模型与产品发布':
      return '🚀';
    case '监管与治理':
      return '📌';
    default:
      return '📰';
  }
}

function trimSummary(summary: string, maxLength = 72) {
  const normalized = cleanNewsText(summary).replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '';
  }

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength).trim()}...`
    : normalized;
}

function buildDeck(title: string, summary: string, topic: string) {
  const trimmed = trimSummary(summary || title, 52);

  switch (topic) {
    case '模型与产品发布':
      return `这一轮产品与模型更新的核心看点是：${trimmed}`;
    case '资本与商业化':
      return `商业化信号还在前移，这条消息最值得注意的是：${trimmed}`;
    case '算力与芯片':
      return `算力基础设施仍是底层主线，当前变化集中在：${trimmed}`;
    case '监管与治理':
      return `政策与治理层面的变化，正在继续影响行业节奏：${trimmed}`;
    default:
      return `过去 12 小时内出现的新动态里，重点落在：${trimmed}`;
  }
}

function buildBody(item: Pick<AiNewsItem, 'title' | 'summary' | 'source'> & { topic: string }) {
  const summaryText = trimSummary(item.summary || item.title, 120);

  switch (item.topic) {
    case '模型与产品发布':
      return `这条消息放回最近 12 小时的新闻流里看，最直接的信号还是模型与产品层面的竞争在加速。${summaryText}。这类动作通常会最先传导到开发者采用速度、产品体验迭代，以及新场景落地的节奏。`;
    case '资本与商业化':
      return `这条新闻真正值得关注的，不只是事件本身，而是商业化正在继续前移。${summaryText}。对行业来说，收入兑现、客户付费和平台扩张的节奏，往往比一时的技术热度更关键。`;
    case '算力与芯片':
      return `算力与芯片相关的消息，通常没有产品发布那么显眼，但它决定的是更底层的行业空间。${summaryText}。无论是训练成本、推理效率还是供应节奏，都会直接影响 AI 公司下一阶段的动作幅度。`;
    case '监管与治理':
      return `监管话题再次升温，说明行业已经进入“增长与边界并行”的阶段。${summaryText}。这类变化会持续影响平台规则、内容分发以及企业客户的决策方式。`;
    default:
      return `${summaryText}。如果把它放回过去 12 小时的整体新闻流里看，这类变化更像是在提醒我们，AI 行业仍在持续推进，而且市场关注点还在快速切换。`;
  }
}

function buildTakeaway(item: Pick<AiNewsItem, 'topic'>) {
  switch (item.topic) {
    case '模型与产品发布':
      return '值得关注的是，这类更新通常会很快传导到用户体验与应用竞争格局。';
    case '资本与商业化':
      return '值得关注的是，商业化进展往往比技术参数更能决定下一阶段的行业分化。';
    case '算力与芯片':
      return '值得关注的是，基础设施层的变化虽然偏底层，却往往决定未来几个月的行业节奏。';
    case '监管与治理':
      return '值得关注的是，规则变化一旦落地，影响范围往往会比单条新闻本身更大。';
    default:
      return '值得关注的是，这条新闻背后反映出的行业趋势，往往比事件本身更重要。';
  }
}

async function fetchArticleImage(link: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PublioBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return undefined;
    }

    const html = await response.text();
    const ogImage =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1];

    if (!ogImage || !/^https?:\/\//i.test(ogImage)) {
      return undefined;
    }

    return decodeHtmlEntities(ogImage);
  } catch {
    return undefined;
  }
}

function buildBriefSummary(item: AiNewsItem) {
  const topic = inferTopic(item.title, item.summary);
  const trimmedSummary = trimSummary(item.summary || item.title);

  switch (topic) {
    case '算力与芯片':
      return `今天值得看的底层变量，仍然来自算力与芯片。${trimmedSummary}，市场关注点依然集中在训练成本、供应节奏与基础设施投入。`;
    case '资本与商业化':
      return `商业化进展还在持续升温。${trimmedSummary}，这类动作会进一步影响行业对收入兑现和落地节奏的判断。`;
    case '模型与产品发布':
      return `模型与产品层面继续上新。${trimmedSummary}，这类动态往往会直接影响新一轮应用落地和用户渗透。`;
    case '监管与治理':
      return `监管与治理话题再次升温。${trimmedSummary}，后续值得继续关注政策边界与平台响应。`;
    default:
      return `过去半天里，行业又冒出了新的观察点。${trimmedSummary}，这些进展还会继续影响市场情绪与业务节奏。`;
  }
}

export function generateAiNewsBriefs(items: AiNewsItem[]): AiNewsBrief[] {
  return items.slice(0, 5).map((item) => ({
    title: item.title,
    summary: buildBriefSummary(item),
    relatedTitles: [item.title],
  }));
}

async function fetchSource(source: NewsSource, cutoffTime: number) {
  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; PublioBot/1.0)',
      Accept: 'application/rss+xml, application/xml, text/xml',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.name}: ${response.status}`);
  }

  const xml = await response.text();

  return extractItems(xml)
    .map((block) => {
      const rawTitle = extractTagValue(block, 'title');
      const title = normalizeNewsTitle(rawTitle);
      const sourceLabel = parseSourceLabel(rawTitle, source.name);
      const summary = cleanNewsText(
        extractTagValue(block, 'description') || extractTagValue(block, 'summary'),
        sourceLabel,
      );
      const publishedAt =
        extractTagValue(block, 'pubDate') ||
        extractTagValue(block, 'published') ||
        extractTagValue(block, 'updated');
      const link = extractLink(block);

      return {
        title,
        summary,
        publishedAt,
        link,
        source: sourceLabel,
      };
    })
    .filter((item) => {
      const publishedTime = new Date(item.publishedAt).getTime();
      return (
        item.title &&
        item.link &&
        hasChinese(`${item.title} ${item.summary}`) &&
        Number.isFinite(publishedTime) &&
        publishedTime >= cutoffTime
      );
    })
    .map((item) => ({
      ...item,
      score: scoreNewsItem(item, source.weight),
      topic: '',
      emoji: '',
      deck: '',
      body: '',
      takeaway: '',
    }));
}

export async function fetchAiNews(hours = 12) {
  const cutoffTime = Date.now() - hours * 60 * 60 * 1000;

  const results = await Promise.allSettled(
    RSS_SOURCES.map((source) => fetchSource(source, cutoffTime)),
  );

  const deduped = new Map<string, AiNewsItem>();

  results.forEach((result) => {
    if (result.status !== 'fulfilled') {
      return;
    }

    result.value.forEach((item) => {
      const key = item.link || normalizeTitle(item.title);
      const existing = deduped.get(key);

      if (!existing || existing.score < item.score) {
        deduped.set(key, item);
      }
    });
  });

  const rankedItems = Array.from(deduped.values())
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    })
    .slice(0, 30);

  const enriched = rankedItems.map((item) => {
    const topic = inferTopic(item.title, item.summary);

    return {
      ...item,
      topic,
      emoji: topicEmoji(topic),
      deck: buildDeck(item.title, item.summary, topic),
      body: buildBody({ ...item, topic }),
      takeaway: buildTakeaway({ topic }),
    };
  });

  const withImages = await Promise.all(
    enriched.map(async (item, index) => {
      if (index > 7) {
        return item;
      }

      const imageUrl = await fetchArticleImage(item.link);
      return imageUrl ? { ...item, imageUrl } : item;
    }),
  );

  return withImages;
}
