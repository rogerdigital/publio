import { PlatformId } from '@/types';

export interface PublishInput {
  title: string;
  markdownContent: string;
  htmlContent: string;
}

export interface PublishOutput {
  success: boolean;
  platform: PlatformId;
  message: string;
  url?: string;
}

export interface Publisher {
  platform: PlatformId;
  publish(input: PublishInput): Promise<PublishOutput>;
  validateConfig(): boolean;
}
