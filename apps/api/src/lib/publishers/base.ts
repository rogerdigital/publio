import type { PlatformId } from '@/types';
import type { Publisher, PublishInput, PublishOutput } from './types';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * 判断错误是否值得重试。
 *
 * 平台错误形态不一：微信用业务 errcode（40001/42001，4-5 位），知乎用 HTTP status，
 * 小红书常只有纯文本 msg。靠解析 message 不可靠，因此采用「明确不可重试则跳过，
 * 其余保守重试」的策略：
 * - 网络层错误（TypeError）→ 可重试
 * - 含认证失效类关键词（过期 / unauthorized / 401 / 40001 / 42001 等）→ 不可重试
 * - 含明确的 4xx（非 429）HTTP 状态码 → 不可重试
 * - 其余（5xx、429、纯文本业务错误等）→ 保守重试
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (!(error instanceof Error)) return true;
  const msg = error.message.toLowerCase();

  // 认证失效类：过期 / unauthorized / HTTP 401 / 微信业务 errcode 40001、42001 / OAuth invalid_grant
  const authKeywords = ['过期', 'expired', 'unauthorized', 'invalid_grant'];
  if (authKeywords.some((kw) => msg.includes(kw.toLowerCase()))) return false;
  // 数字码单独用正则带边界匹配，避免子串误匹配（如 '401' 误中更大的数字串）
  if (/\b(401|40001|42001)\b/.test(msg)) return false;

  // 明确的 4xx（非 429）→ 不可重试
  const status = msg.match(/\b(4\d\d)\b/)?.[1];
  if (status && status !== '429') return false;

  return true;
}

export abstract class BasePublisher implements Publisher {
  abstract platform: PlatformId;
  abstract validateConfig(): boolean;
  protected abstract publishToPlatform(input: PublishInput): Promise<PublishOutput>;

  private static tokenCache = new Map<string, { token: string; expiresAt: number }>();

  protected getCachedToken(key: string): string | null {
    const entry = BasePublisher.tokenCache.get(key);
    if (entry && Date.now() < entry.expiresAt) return entry.token;
    BasePublisher.tokenCache.delete(key);
    return null;
  }

  protected setCachedToken(key: string, token: string, expiresInSec: number): void {
    BasePublisher.tokenCache.set(key, {
      token,
      expiresAt: Date.now() + (expiresInSec - 300) * 1000,
    });
  }

  protected clearCachedToken(key: string): void {
    BasePublisher.tokenCache.delete(key);
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        // 不可重试的错误（4xx 非 429、认证失效等）直接抛，不再白等退避时间
        if (!isRetryableError(error)) throw lastError;
        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
    throw lastError;
  }

  async publish(input: PublishInput): Promise<PublishOutput> {
    if (!this.validateConfig()) {
      return {
        success: false,
        platform: this.platform,
        message: `${this.platform} 凭证未配置`,
      };
    }

    try {
      return await this.retryWithBackoff(() => this.publishToPlatform(input));
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        message: error instanceof Error ? error.message : `${this.platform} 发布失败`,
      };
    }
  }
}
