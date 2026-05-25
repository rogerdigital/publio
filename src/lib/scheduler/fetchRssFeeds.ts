import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { buildAiNewsDesk } from '@/lib/ai-news/index';
import { persistSignalsFromDesk } from '@/lib/ai-news/persistSignals';
import { setCache } from '@/lib/cache';
import { logger } from '@/lib/logger';

const RSS_FETCH_INTERVAL_MS = 30 * 60 * 1000;
const CACHE_TTL = 30 * 60 * 1000;
const DESK_FILENAME = 'ai-news-desk.json';

function getDataDir(): string {
  return process.env.PUBLIO_DATA_DIR ?? join(process.cwd(), '.publio-data');
}

function getDeskFilePath(): string {
  return join(getDataDir(), DESK_FILENAME);
}

function atomicWriteJson(filePath: string, data: unknown) {
  mkdirSync(dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  writeFileSync(tempPath, JSON.stringify(data), 'utf-8');
  renameSync(tempPath, filePath);
}

export async function preComputeAiNewsDesk() {
  logger.info('Pre-computing AI news desk started');

  const desk = await buildAiNewsDesk(24, 40, 10);

  const allNormalizedSignals = [...desk.todayCandidates, ...desk.followCandidates].flatMap(
    (candidate) => candidate.signals,
  );
  const signalIds = persistSignalsFromDesk(allNormalizedSignals);

  const data = {
    generatedAt: desk.generatedAt,
    totalSignals: desk.totalSignals,
    totalCandidates: desk.totalCandidates,
    todayCandidates: desk.todayCandidates,
    followCandidates: desk.followCandidates,
    selectedResearch: desk.selectedResearch,
    signalIds,
  };

  atomicWriteJson(getDeskFilePath(), data);
  setCache('ai-news-desk', data, CACHE_TTL);

  logger.info('Pre-computed AI news desk saved', {
    totalSignals: desk.totalSignals,
    signalCount: signalIds.length,
  });
}

export function readPreComputedDesk(): Record<string, unknown> | null {
  try {
    const raw = readFileSync(getDeskFilePath(), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getRssFetchIntervalMs() {
  return RSS_FETCH_INTERVAL_MS;
}
