export interface ScheduledTask {
  name: string;
  /** 执行间隔（毫秒） */
  intervalMs: number;
  /** 任务执行函数 */
  handler: () => Promise<void>;
  /** 是否在启动时立即执行一次 */
  runOnStart?: boolean;
}

export interface TaskState {
  name: string;
  intervalMs: number;
  lastRunAt: string | null;
  lastError: string | null;
  nextRunAt: string | null;
  running: boolean;
}

export interface SchedulerStatus {
  running: boolean;
  tasks: TaskState[];
}
