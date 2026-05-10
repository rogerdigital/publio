import { readJsonFileCollection, writeJsonFileCollection } from '@/lib/storage/jsonFileCollection';
import { createLocalDataPath } from '@/lib/storage/localDataPath';

export interface StyleProfile {
  description: string; // 风格描述
  updatedAt: string;
}

const STYLE_FILE = createLocalDataPath('style-profile.json');

function readAll(): StyleProfile[] {
  return readJsonFileCollection<StyleProfile>(STYLE_FILE);
}

function writeAll(data: StyleProfile[]) {
  writeJsonFileCollection(STYLE_FILE, data);
}

export function getStyleProfile(): StyleProfile | null {
  return readAll()[0] ?? null;
}

export function saveStyleProfile(description: string): StyleProfile {
  const entry: StyleProfile = {
    description: description.trim(),
    updatedAt: new Date().toISOString(),
  };
  writeAll([entry]);
  return entry;
}

/**
 * 从用户草稿中提取风格特征，生成 prompt
 */
export function buildStyleAnalysisPrompt(
  drafts: Array<{ title: string; content: string }>,
): string {
  const samples = drafts
    .slice(0, 5)
    .map(
      (d, i) =>
        `### 样本 ${i + 1}: ${d.title}\n${d.content.slice(0, 1000)}${d.content.length > 1000 ? '...' : ''}`,
    )
    .join('\n\n');

  return `请分析以下文章样本，总结作者的写作风格特征。输出一段简洁的风格描述（100-200字），包括：
- 句式偏好（长短句比例）
- 常用修辞或表达习惯
- 段落结构特点
- 用词风格（正式/口语/专业术语密度）
- 是否使用 emoji 或特殊符号

## 文章样本
${samples}

请直接输出风格描述，不要加标题或前缀。`;
}
