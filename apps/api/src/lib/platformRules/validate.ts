import type { PlatformId } from '@/types';
import type { ValidationResult, ValidationIssue } from './types';
import { getRuleForPlatform } from './rules';

export function validateForPlatform(
  title: string,
  content: string,
  platform: PlatformId,
): ValidationResult {
  const rule = getRuleForPlatform(platform);
  if (!rule) return { passed: true, issues: [] };

  const issues: ValidationIssue[] = [];

  // Title validation
  if (rule.title) {
    const titleLen = title.trim().length;
    if (titleLen === 0) {
      issues.push({
        severity: 'error',
        field: 'title',
        message: '标题不能为空',
      });
    } else if (titleLen > rule.title.maxLength) {
      issues.push({
        severity: 'warning',
        field: 'title',
        message: `标题超出字数限制`,
        current: titleLen,
        limit: rule.title.maxLength,
      });
    }
  }

  // Content validation
  const contentLen = content.trim().length;
  if (contentLen === 0) {
    issues.push({
      severity: 'error',
      field: 'content',
      message: '内容不能为空',
    });
  } else {
    if (rule.content.minLength !== undefined && contentLen < rule.content.minLength) {
      issues.push({
        severity: 'warning',
        field: 'content',
        message: `内容少于建议字数`,
        current: contentLen,
        limit: rule.content.minLength,
      });
    }
    if (contentLen > rule.content.maxLength) {
      issues.push({
        severity: 'warning',
        field: 'content',
        message: `内容超出字数限制，发布时可能被截断`,
        current: contentLen,
        limit: rule.content.maxLength,
      });
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'error');
  return { passed: !hasErrors, issues };
}

export function validateForAllPlatforms(
  title: string,
  content: string,
  platforms: PlatformId[],
): Record<PlatformId, ValidationResult> {
  const results: Record<string, ValidationResult> = {};
  for (const platform of platforms) {
    results[platform] = validateForPlatform(title, content, platform);
  }
  return results as Record<PlatformId, ValidationResult>;
}
