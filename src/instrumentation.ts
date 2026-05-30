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
  }
}
