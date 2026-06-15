import type { ContentDraft, CreateDraftInput } from './types';

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
 * 从 Markdown 文件内容解析出草稿数据
 * 支持带 YAML frontmatter 和纯 Markdown
 */
export function parseMarkdownToDraft(
  markdown: string,
): Pick<CreateDraftInput, 'title' | 'content' | 'source'> {
  const frontmatterMatch = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(markdown);

  if (frontmatterMatch) {
    const yaml = frontmatterMatch[1];
    const content = frontmatterMatch[2].trim();

    const titleMatch = /^title:\s*"?(.+?)"?\s*$/m.exec(yaml);
    const title = titleMatch ? titleMatch[1].replace(/\\"/g, '"') : '';

    return { title, content, source: 'import' };
  }

  // 纯 Markdown：第一行非空行作为标题
  const lines = markdown.split('\n');
  const firstNonEmpty = lines.find((l) => l.trim().length > 0) ?? '';
  const h1Match = /^#\s+(.+)$/.exec(firstNonEmpty);
  const title = h1Match ? h1Match[1].trim() : firstNonEmpty.slice(0, 60).trim();
  const content = markdown.trim();

  return { title, content, source: 'import' };
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

/**
 * 读取文件内容为文本
 */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file, 'utf-8');
  });
}
