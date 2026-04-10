export function countCharacters(content: string) {
  return content.replace(/\s/g, '').length;
}

export function countParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

export function countHeadings(content: string) {
  return (content.match(/^#{1,6}\s+/gm) || []).length;
}

export function countCjkCharacters(content: string) {
  return (
    content.match(
      /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff\u31f0-\u31ff\uac00-\ud7af]/g,
    ) || []
  ).length;
}

export function countLatinWords(content: string) {
  return content
    .replace(
      /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff\u31f0-\u31ff\uac00-\ud7af]/g,
      ' ',
    )
    .split(/\s+/)
    .filter(Boolean).length;
}

export function estimateReadTime(content: string) {
  const cjk = countCjkCharacters(content);
  const latin = countLatinWords(content);
  const minutes = Math.max(1, Math.ceil(cjk / 380 + latin / 220));
  return `${minutes} 分钟`;
}
