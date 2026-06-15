import type { PlatformId } from '@/types';
import type { Publisher, PublishInput, PublishOutput } from './types';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

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
