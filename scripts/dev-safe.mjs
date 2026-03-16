import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const port = process.env.PORT || '3000';
const nextCacheDir = path.join(projectRoot, '.next', 'cache');

function run(command, args) {
  return execFileSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function tryRun(command, args) {
  try {
    return run(command, args);
  } catch {
    return '';
  }
}

function findListeningPids(targetPort) {
  const output = tryRun('lsof', ['-nP', `-iTCP:${targetPort}`, '-sTCP:LISTEN', '-t']);
  return output
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean);
}

function getCommandLine(pid) {
  return tryRun('ps', ['-p', pid, '-o', 'command=']);
}

function isPublioNextProcess(commandLine) {
  return (
    commandLine.includes('next dev') ||
    commandLine.includes(`${path.sep}publio${path.sep}`) ||
    commandLine.includes('pnpm dev')
  );
}

function killProcess(pid) {
  execFileSync('kill', [pid], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function waitForPortRelease(targetPort, attempts = 20) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (findListeningPids(targetPort).length === 0) {
      return true;
    }

    sleep(150);
  }

  return false;
}

function clearNextCache() {
  fs.rmSync(nextCacheDir, { recursive: true, force: true });
}

function ensurePortReady(targetPort) {
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

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
