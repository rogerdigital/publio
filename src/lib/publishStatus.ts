import type {
  PlatformPublishResult,
  PlatformPublishStatus,
  PublishStatus,
} from '@/types';

export type PublishResultDisplayState = 'success' | 'error' | 'publishing';

export function toPublishResultDisplayState(
  status: PlatformPublishStatus,
): PublishResultDisplayState {
  if (status === 'error' || status === 'failed') {
    return 'error';
  }

  if (status === 'pending' || status === 'publishing') {
    return 'publishing';
  }

  return 'success';
}

export function resolveOverallPublishStatus(
  results: PlatformPublishResult[],
): PublishStatus {
  if (results.length === 0) return 'idle';

  const hasInFlight = results.some(
    (result) => result.status === 'pending' || result.status === 'publishing',
  );
  if (hasInFlight) return 'publishing';

  const hasError = results.some(
    (result) => toPublishResultDisplayState(result.status) === 'error',
  );
  return hasError ? 'error' : 'success';
}
