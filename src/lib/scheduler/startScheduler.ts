import { checkDueDrafts } from './checkDueDrafts';

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startScheduler() {
  if (intervalId) return;
  intervalId = setInterval(() => {
    void checkDueDrafts();
  }, 60_000);

  // 立即执行一次检查
  void checkDueDrafts();
}

export function stopScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
