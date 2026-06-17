import type { ContentDraft } from './types';

/**
 * 将草稿导出为 Markdown 文件内容（带 YAML frontmatter）
 */
export function exportDraftToMarkdown(draft: ContentDraft): string {
  const frontmatter = [
    '---',
    `title: "${draft.title.replace(/"/g, '\\"')}"`,
    `date: ${draft.createdAt}`,
    `updated: ${draft.updatedAt}`,
    `status: ${draft.status}`,
    `source: ${draft.source}`,
    ...(draft.tags?.length ? [`tags: [${draft.tags.map((t) => `"${t}"`).join(', ')}]`] : []),
    ...(draft.platforms?.length ? [`platforms: [${draft.platforms.join(', ')}]`] : []),
    '---',
  ].join('\n');

  return `${frontmatter}\n\n${draft.content}`;
}

/**
 * 触发浏览器下载
 */
export function downloadFile(filename: string, content: string, mimeType = 'text/markdown') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
