import type { ContentDraft } from './types';

interface ParsedMarkdownImport {
  title: string;
  content: string;
}

interface MarkdownH1 {
  index: number;
  title: string;
}

function unquoteTitle(value: string): string {
  const trimmed = value.trim();
  const quote = trimmed[0];

  if ((quote === '"' || quote === "'") && trimmed.at(-1) === quote) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function trimBlankLines(lines: string[]): string[] {
  while (lines[0]?.trim() === '') lines.shift();
  while (lines.at(-1)?.trim() === '') lines.pop();

  return lines;
}

function splitTrimmedMarkdown(raw: string): string[] {
  return trimBlankLines(
    raw
      .replace(/^\uFEFF/, '')
      .replace(/\r\n?/g, '\n')
      .split('\n'),
  );
}

function findFirstMarkdownH1(lines: string[]): MarkdownH1 | undefined {
  let fence: { marker: '`' | '~'; length: number } | undefined;

  for (const [index, line] of lines.entries()) {
    if (fence) {
      const closing = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
      if (closing && closing[1][0] === fence.marker && closing[1].length >= fence.length) {
        fence = undefined;
      }
      continue;
    }

    if (line.startsWith('\t') || line.startsWith('    ')) continue;

    const opening = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (opening) {
      fence = {
        marker: opening[1][0] as '`' | '~',
        length: opening[1].length,
      };
      continue;
    }

    const heading = line.match(/^ {0,3}#\s+(.+?)\s*$/);
    if (heading) return { index, title: heading[1].trim() };
  }

  return undefined;
}

/**
 * 读取本地 Markdown 文件，提取可直接创建稿件的标题与正文。
 */
export function parseMarkdownImport(filename: string, raw: string): ParsedMarkdownImport {
  if (!filename.toLowerCase().endsWith('.md')) {
    throw new Error('请选择 Markdown 文件');
  }

  const lines = splitTrimmedMarkdown(raw);
  let frontmatterTitle: string | undefined;

  if (lines[0] === '---') {
    const closingIndex = lines.indexOf('---', 1);

    if (closingIndex >= 0) {
      const frontmatterLines = lines.slice(1, closingIndex);
      for (const line of frontmatterLines) {
        const match = line.match(/^\s*title\s*:\s*(.*)$/i);
        if (match) {
          frontmatterTitle = unquoteTitle(match[1]);
          break;
        }
      }
      lines.splice(0, closingIndex + 1);
    }
  }

  const h1 = findFirstMarkdownH1(lines);
  const title = (frontmatterTitle || h1?.title || filename.slice(0, -3)).trim();

  if (!frontmatterTitle && h1) {
    lines.splice(h1.index, 1);
  }

  const content = trimBlankLines(lines).join('\n');
  if (!content) {
    throw new Error('Markdown 文件没有正文内容');
  }
  if (!title) {
    throw new Error('无法确定稿件标题');
  }

  return { title, content };
}

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
