// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/storage/envFile', () => ({
  readFile: vi.fn(),
}));

describe('githubUpload', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns null config when env vars are missing', async () => {
    process.env.GITHUB_IMAGE_TOKEN = '';
    process.env.GITHUB_IMAGE_OWNER = '';
    process.env.GITHUB_IMAGE_REPO = '';
    process.env.GITHUB_IMAGE_ENABLED = 'true';

    const { getGitHubImageConfig } = await import('../githubUpload');
    expect(getGitHubImageConfig()).toBeNull();
  });

  it('returns config when all required env vars are set', async () => {
    process.env.GITHUB_IMAGE_TOKEN = 'ghp_test123';
    process.env.GITHUB_IMAGE_OWNER = 'testuser';
    process.env.GITHUB_IMAGE_REPO = 'images';
    process.env.GITHUB_IMAGE_BRANCH = 'main';
    process.env.GITHUB_IMAGE_PATH = 'publio/';
    process.env.GITHUB_IMAGE_ENABLED = 'true';

    const { getGitHubImageConfig } = await import('../githubUpload');
    const config = getGitHubImageConfig();
    expect(config).not.toBeNull();
    expect(config?.enabled).toBe(true);
    expect(config?.owner).toBe('testuser');
  });

  it('isGitHubImageBedEnabled returns false when config is null', async () => {
    process.env.GITHUB_IMAGE_TOKEN = '';
    process.env.GITHUB_IMAGE_OWNER = '';
    process.env.GITHUB_IMAGE_REPO = '';

    const { isGitHubImageBedEnabled } = await import('../githubUpload');
    expect(isGitHubImageBedEnabled()).toBe(false);
  });

  it('isGitHubImageBedEnabled returns false when enabled flag is not set', async () => {
    process.env.GITHUB_IMAGE_TOKEN = 'ghp_test';
    process.env.GITHUB_IMAGE_OWNER = 'user';
    process.env.GITHUB_IMAGE_REPO = 'repo';
    process.env.GITHUB_IMAGE_ENABLED = '';

    const { isGitHubImageBedEnabled } = await import('../githubUpload');
    expect(isGitHubImageBedEnabled()).toBe(false);
  });
});
