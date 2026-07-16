import { describe, expect, it } from 'vitest';
import { parseMarkdownImport } from './importExport';

describe('parseMarkdownImport', () => {
  it('uses the first frontmatter title and normalizes line endings', () => {
    const result = parseMarkdownImport(
      'article.MD',
      '---\r\nTITLE: "Frontmatter title"\r\ntitle: ignored\r\n---\r\n\r\n# Body heading\rBody',
    );

    expect(result).toEqual({
      title: 'Frontmatter title',
      content: '# Body heading\nBody',
    });
  });

  it('removes a BOM and the H1 used as the title', () => {
    const result = parseMarkdownImport('note.md', '\uFEFF# Imported title\n\nParagraph');

    expect(result).toEqual({
      title: 'Imported title',
      content: 'Paragraph',
    });
  });

  it('falls back to the filename when the body has no H1', () => {
    expect(parseMarkdownImport('filename fallback.md', 'Paragraph')).toEqual({
      title: 'filename fallback',
      content: 'Paragraph',
    });
  });

  it('ignores H1-like lines inside backtick fences', () => {
    const content = '```sh\n# shell comment\necho done\n```';

    expect(parseMarkdownImport('backtick.md', content)).toEqual({
      title: 'backtick',
      content,
    });
  });

  it('ignores H1-like lines inside tilde fences', () => {
    const content = '~~~sh\n# shell comment\necho done\n~~~';

    expect(parseMarkdownImport('tilde.md', content)).toEqual({
      title: 'tilde',
      content,
    });
  });

  it('ignores H1-like lines in indented code', () => {
    const content = '    # shell comment\n\t# tab comment\nParagraph';

    expect(parseMarkdownImport('indented.md', content)).toEqual({
      title: 'indented',
      content,
    });
  });

  it('rejects non-Markdown files', () => {
    expect(() => parseMarkdownImport('article.txt', '# Title\n\nBody')).toThrow(
      '请选择 Markdown 文件',
    );
  });

  it('rejects Markdown without body content', () => {
    expect(() => parseMarkdownImport('empty.md', '# Title')).toThrow('Markdown 文件没有正文内容');
  });

  it('rejects Markdown when no title can be determined', () => {
    expect(() => parseMarkdownImport('.md', 'Paragraph')).toThrow('无法确定稿件标题');
  });
});
