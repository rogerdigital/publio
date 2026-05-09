import { getDraftRegistry } from '@/lib/drafts/registry';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import { runPublishJob } from '@/lib/publishers/publishJobRunner';
import type { PlatformId } from '@/types';

export async function checkDueDrafts() {
  const drafts = getDraftRegistry().listDrafts({ includeArchived: true });
  const now = new Date();

  const dueDrafts = drafts.filter(
    (d) =>
      d.scheduledAt &&
      new Date(d.scheduledAt) <= now &&
      d.status === 'draft' &&
      d.platforms &&
      d.platforms.length > 0,
  );

  for (const draft of dueDrafts) {
    // Mark as syncing to prevent duplicate execution
    getDraftRegistry().updateDraft(draft.id, { status: 'syncing' });

    const platforms = draft.platforms as PlatformId[];
    const syncStore = getSyncHistoryStore();
    const syncTask = syncStore.createTask({
      draftId: draft.id,
      title: draft.title,
      platforms,
    });

    await runPublishJob({
      syncTaskId: syncTask.id,
      title: draft.title,
      content: draft.content,
      platforms,
      clearScheduledAt: true,
    });
  }
}
