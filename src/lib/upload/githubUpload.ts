import { randomUUID } from 'node:crypto';
import { readFile } from '@/lib/storage/envFile';

const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const MAX_SIZE = 5 * 1024 * 1024;

const EXT_MAP: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export interface GitHubImageConfig {
  enabled: boolean;
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export function getGitHubImageConfig(): GitHubImageConfig | null {
  // Read env at runtime (hot-reload after settings save)
  const env = process.env;
  const token = env.GITHUB_IMAGE_TOKEN || '';
  const owner = env.GITHUB_IMAGE_OWNER || '';
  const repo = env.GITHUB_IMAGE_REPO || '';
  const branch = env.GITHUB_IMAGE_BRANCH || 'main';
  const path = env.GITHUB_IMAGE_PATH || 'images/';
  const enabled = env.GITHUB_IMAGE_ENABLED === 'true';

  if (!token || !owner || !repo) return null;
  return { enabled, token, owner, repo, branch, path };
}

export function isGitHubImageBedEnabled(): boolean {
  const config = getGitHubImageConfig();
  return config !== null && config.enabled;
}

export async function uploadToGitHub(file: File): Promise<{ url: string; filename: string }> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`不支持的文件类型: ${file.type}`);
  }
  if (file.size > MAX_SIZE) {
    throw new Error('文件大小不能超过 5MB');
  }

  const config = getGitHubImageConfig();
  if (!config) throw new Error('GitHub 图床未配置');

  const ext = EXT_MAP[file.type] || 'png';
  const filename = `${randomUUID()}.${ext}`;
  const filePath = `${config.path}${filename}`.replace(/\/+/g, '/');

  const arrayBuffer = await file.arrayBuffer();
  const content = Buffer.from(arrayBuffer).toString('base64');

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${config.token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: `Upload image via Publio`,
      content,
      branch: config.branch,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `GitHub API error: ${res.status}`);
  }

  const data = (await res.json()) as { content: { download_url: string } };
  return {
    url: data.content.download_url,
    filename,
  };
}
