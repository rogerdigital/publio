import type { PlatformId } from '@/types';
import type { PublishCheckResult, PublishCheckSummary } from './types';
import { validateForPlatform } from '@/lib/platformRules/validate';
import { checkContent } from '@/lib/moderation/check';
import { getPlatformVariantRegistry } from '@/lib/platformVariants/registry';
import type { PlatformConnectionProfile } from '@/lib/platformConnections/types';

export interface RunChecksInput {
  title: string;
  content: string;
  platforms: PlatformId[];
  draftId?: string;
  variantIds?: Partial<Record<PlatformId, string | null>>;
  connectionProfiles?: PlatformConnectionProfile[];
}

export function runPublishChecks(input: RunChecksInput): PublishCheckSummary {
  const checks: PublishCheckResult[] = [];
  let idCounter = 0;
  const nextId = () => `check-${++idCounter}`;

  // Global: title empty
  if (!input.title.trim()) {
    checks.push({
      id: nextId(),
      platform: 'global',
      severity: 'error',
      message: '标题不能为空',
      nextAction: '填写标题',
      field: 'title',
    });
  }

  // Global: content empty
  if (!input.content.trim()) {
    checks.push({
      id: nextId(),
      platform: 'global',
      severity: 'error',
      message: '正文不能为空',
      nextAction: '填写正文',
      field: 'content',
    });
  }

  // Global: moderation
  const moderation = checkContent(`${input.title}\n${input.content}`);
  if (!moderation.passed) {
    checks.push({
      id: nextId(),
      platform: 'global',
      severity: 'warning',
      message: `检测到 ${moderation.matches.length} 个敏感词`,
      nextAction: '确认内容安全后强制发布',
    });
  }

  // Connection status (optional, provided by caller)
  if (input.connectionProfiles) {
    for (const platform of input.platforms) {
      const profile = input.connectionProfiles.find((p) => p.platform === platform);
      if (profile && profile.status !== 'connected') {
        checks.push({
          id: nextId(),
          platform,
          severity: profile.missingKeys.length > 0 ? 'error' : 'warning',
          message: `${platform} 未连接`,
          nextAction:
            profile.missingKeys.length > 0
              ? `配置缺失字段: ${profile.missingKeys.join(', ')}`
              : '前往设置页连接平台',
        });
      }
    }
  }

  // Per-platform checks
  const variantRegistry = getPlatformVariantRegistry();
  for (const platform of input.platforms) {
    let variantTitle = input.title;
    let variantContent = input.content;
    let hasVariant = false;

    // Resolve variant content
    const vid = input.variantIds?.[platform];
    if (vid) {
      const variant = variantRegistry.getVariant(vid);
      if (variant) {
        variantTitle = variant.title;
        variantContent = variant.content;
        hasVariant = true;

        if (variant.status === 'synced' && !variant.manuallyEdited && !variant.generatedByAgent) {
          checks.push({
            id: nextId(),
            platform,
            severity: 'info',
            message: '渠道版本为主稿同步，未经过适配或编辑',
            nextAction: '可运行 AI 适配优化该渠道内容',
          });
        }
      }
    }

    if (!hasVariant && input.draftId) {
      const existing = variantRegistry.getVariantByDraftAndPlatform(input.draftId, platform);
      if (existing) {
        variantTitle = existing.title;
        variantContent = existing.content;
        hasVariant = true;
      }
    }

    if (!hasVariant) {
      checks.push({
        id: nextId(),
        platform,
        severity: 'info',
        message: '该渠道暂无独立版本，将使用主稿内容',
        nextAction: '同步渠道版本或运行 AI 适配',
      });
    }

    // Platform rule validation
    const validation = validateForPlatform(variantTitle, variantContent, platform);
    for (const issue of validation.issues) {
      checks.push({
        id: nextId(),
        platform,
        severity: issue.severity === 'error' ? 'error' : 'warning',
        message:
          issue.message +
          (issue.current !== undefined && issue.limit !== undefined
            ? ` (${issue.current}/${issue.limit})`
            : ''),
        nextAction: issue.severity === 'error' ? '修复后才能发布' : '建议修改以获得更好效果',
        field: issue.field,
      });
    }

    // Image link check
    const imgMatches = variantContent.match(/!\[.*?\]\((.*?)\)/g);
    if (imgMatches) {
      const brokenImages = imgMatches.filter((m) => {
        const url = m.match(/\((.*?)\)/)?.[1];
        return url && !url.startsWith('http');
      });
      if (brokenImages.length > 0) {
        checks.push({
          id: nextId(),
          platform,
          severity: 'warning',
          message: `${brokenImages.length} 张图片使用非公网链接`,
          nextAction: '替换为可公开访问的 URL',
        });
      }
    }
  }

  const hasErrors = checks.some((c) => c.severity === 'error');
  const hasWarnings = checks.some((c) => c.severity === 'warning');

  const byPlatform: Record<string, PublishCheckResult[]> = {};
  for (const check of checks) {
    const key = check.platform;
    if (!byPlatform[key]) byPlatform[key] = [];
    byPlatform[key].push(check);
  }

  return {
    canPublish: !hasErrors,
    hasWarnings,
    checks,
    byPlatform,
  };
}
