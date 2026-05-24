import { getSyncHistoryStore } from '@/lib/sync/registry';
import { getDraftRegistry } from '@/lib/drafts/registry';
import { getSiteUrl } from '@/lib/config';

export const dynamic = 'force-dynamic';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toRfc822(dateStr: string): string {
  return new Date(dateStr).toUTCString();
}

export async function GET() {
  try {
    const siteUrl = getSiteUrl();
    const tasks = getSyncHistoryStore()
      .listTasks()
      .filter((t) => t.status === 'completed')
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 50);

    const draftRegistry = getDraftRegistry();

    const items = tasks
      .map((task) => {
        if (!task.draftId) return null;
        const draft = draftRegistry.getDraft(task.draftId);
        if (!draft) return null;

        const receipt = task.receipts.find((r) => r.url);
        const link = receipt?.url ?? `${siteUrl}/sync-tasks/${task.id}`;
        const excerpt = draft.content.slice(0, 200).replace(/\n/g, ' ').trim();

        return `    <item>
      <title>${escapeXml(draft.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(excerpt)}</description>
      <pubDate>${toRfc822(task.createdAt)}</pubDate>
      <guid isPermaLink="${receipt?.url ? 'true' : 'false'}">${escapeXml(link)}</guid>
    </item>`;
      })
      .filter(Boolean)
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Publio - 已发布内容</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>通过 Publio 分发的已发布内容</description>
    <language>zh-CN</language>
    <atom:link href="${escapeXml(`${siteUrl}/feed/published.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch {
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel></channel></rss>',
      {
        status: 500,
        headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      },
    );
  }
}
