type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

function formatEntry(entry: LogEntry): string {
  const { level, message, timestamp, context } = entry;
  const prefix = `[${timestamp}] ${level.toUpperCase()}`;
  if (context && Object.keys(context).length > 0) {
    return `${prefix} ${message} ${JSON.stringify(context)}`;
  }
  return `${prefix} ${message}`;
}

function createEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): LogEntry {
  return { level, message, timestamp: new Date().toISOString(), context };
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatEntry(createEntry('debug', message, context)));
    }
  },

  info(message: string, context?: Record<string, unknown>) {
    console.info(formatEntry(createEntry('info', message, context)));
  },

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(formatEntry(createEntry('warn', message, context)));
  },

  error(message: string, context?: Record<string, unknown>) {
    console.error(formatEntry(createEntry('error', message, context)));
  },
};
