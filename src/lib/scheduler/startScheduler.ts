import { logger } from '@/lib/logger';
import type { ScheduledTask, TaskState, SchedulerStatus } from './types';

const tasks = new Map<string, ScheduledTask>();
const state = new Map<string, TaskState>();
const timers = new Map<string, ReturnType<typeof setInterval>>();
let running = false;

// 注册一个定时任务（可在 start 前多次调用）
export function registerTask(task: ScheduledTask) {
  tasks.set(task.name, task);
  state.set(task.name, {
    name: task.name,
    intervalMs: task.intervalMs,
    lastRunAt: null,
    lastError: null,
    nextRunAt: null,
    running: false,
  });
}

async function runTask(task: ScheduledTask) {
  const s = state.get(task.name);
  if (!s || s.running) return;

  s.running = true;
  s.lastError = null;
  try {
    await task.handler();
    s.lastRunAt = new Date().toISOString();
  } catch (err) {
    s.lastError = err instanceof Error ? err.message : String(err);
    logger.error(`Scheduled task "${task.name}" failed`, { error: s.lastError });
  } finally {
    s.running = false;
    s.nextRunAt = new Date(Date.now() + task.intervalMs).toISOString();
  }
}

/** 启动所有已注册的定时任务 */
export function startScheduler() {
  if (running) return;
  running = true;

  for (const task of tasks.values()) {
    const s = state.get(task.name);
    if (s) {
      s.nextRunAt = new Date(Date.now() + task.intervalMs).toISOString();
    }

    if (task.runOnStart) {
      void runTask(task);
    }

    const timer = setInterval(() => {
      void runTask(task);
    }, task.intervalMs);

    timers.set(task.name, timer);
    logger.info(`Scheduled task "${task.name}" started`, { intervalMs: task.intervalMs });
  }
}

/** 停止所有定时任务 */
export function stopScheduler() {
  running = false;
  for (const [name, timer] of timers) {
    clearInterval(timer);
    timers.delete(name);
  }
}

/** 获取调度器运行状态 */
export function getSchedulerStatus(): SchedulerStatus {
  return {
    running,
    tasks: Array.from(state.values()),
  };
}
