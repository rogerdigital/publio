import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot: string = process.cwd();
const port: string = process.env['PORT'] ?? '3000';
const nextCacheDir: string = path.join(projectRoot, '.next', 'cache');

function run(command: string, args: string[]): string {
  return execFileSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function tryRun(command: string, args: string[]): string {
  try {
    return run(command, args);
  } catch {
    return '';
  }
}

function findListeningPids(targetPort: string): string[] {
  const output = tryRun('lsof', ['-nP', `-iTCP:${targetPort}`, '-sTCP:LISTEN', '-t']);
  return output
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean);
}

function getCommandLine(pid: string): string {
  return tryRun('ps', ['-p', pid, '-o', 'command=']);
}

function isPublioNextProcess(commandLine: string): boolean {
  return (
    commandLine.includes('next dev') ||
    commandLine.includes(`${path.sep}publio${path.sep}`) ||
    commandLine.includes('pnpm dev')
  );
}

function killProcess(pid: string): void {
  execFileSync('kill', [pid], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
}

function sleep(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function waitForPortRelease(targetPort: string, attempts = 20): boolean {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (findListeningPids(targetPort).length === 0) {
      return true;
    }
    sleep(150);
  }
  return false;
}

function clearNextCache(): void {
  fs.rmSync(nextCacheDir, { recursive: true, force: true });
}

function ensurePortReady(targetPort: string): void {
  const pids = findListeningPids(targetPort);

  if (pids.length === 0) {
    return;
  }

  for (const pid of pids) {
    const commandLine = getCommandLine(pid);

    if (!commandLine) {
      continue;
    }

    if (isPublioNextProcess(commandLine)) {
      console.log(`[dev-safe] Stopping stale dev process ${pid} on port ${targetPort}`);
      killProcess(pid);
      continue;
    }

    console.log(
      `[dev-safe] Port ${targetPort} is used by another process. Keeping it alive and letting Next choose a fallback port.`,
    );
    return;
  }

  const released = waitForPortRelease(targetPort);
  if (!released) {
    console.log(
      `[dev-safe] Port ${targetPort} is still busy after cleanup. Next.js may fall back to another port.`,
    );
  }
}

ensurePortReady(port);
clearNextCache();
console.log('[dev-safe] Cleared .next/cache before starting Next.js');

const child = spawn('pnpm', ['run', 'dev:raw'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

child.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
