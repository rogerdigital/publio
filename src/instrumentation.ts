export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runMigrations } = await import('@/lib/storage/migrations/runMigrations');
    const { join } = await import('node:path');
    const dataDir = process.env.PUBLIO_DATA_DIR ?? join(process.cwd(), '.publio-data');
    try {
      runMigrations(dataDir);
    } catch (err) {
      console.error('[publio] Migration failed:', err);
    }

    const { registerTask, startScheduler } = await import('@/lib/scheduler');
    const { checkDueDrafts } = await import('@/lib/scheduler/checkDueDrafts');
    const { fetchAndPersistRssSignals, getRssFetchIntervalMs } =
      await import('@/lib/scheduler/fetchRssFeeds');
    const { generateDailyDigest, getDigestIntervalMs } =
      await import('@/lib/scheduler/generateDailyDigest');

    registerTask({
      name: 'check-due-drafts',
      intervalMs: 60_000,
      handler: checkDueDrafts,
      runOnStart: true,
    });

    registerTask({
      name: 'fetch-rss-feeds',
      intervalMs: getRssFetchIntervalMs(),
      handler: fetchAndPersistRssSignals,
      runOnStart: true,
    });

    registerTask({
      name: 'generate-daily-digest',
      intervalMs: getDigestIntervalMs(),
      handler: generateDailyDigest,
      runOnStart: false,
    });

    startScheduler();
  }
}
