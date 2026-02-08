import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import process from 'node:process';
import { chromium, webkit, devices } from 'playwright';

const STRICT_MODE = process.argv.includes('--strict');
const EXTERNAL_URL = process.env.PERF_SMOKE_URL;
const HOST = process.env.PERF_SMOKE_HOST || '127.0.0.1';
const PORT = Number(process.env.PERF_SMOKE_PORT || 4173);
const TARGET_URL = EXTERNAL_URL || `http://${HOST}:${PORT}`;

const PROBE_SETUP = `
(() => {
  const probe = {
    running: true,
    frames: [],
    start: 0,
    last: 0,
    longTasks: 0,
    longTaskDuration: 0,
    longTaskObserverReady: false
  };

  window.__landingPerfProbe = probe;

  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          probe.longTasks += 1;
          probe.longTaskDuration += entry.duration;
        });
      });

      observer.observe({ type: 'longtask', buffered: true });
      probe.longTaskObserverReady = true;
      probe.longTaskObserver = observer;
    } catch (error) {
      probe.longTaskObserverReady = false;
    }
  }

  const tick = (ts) => {
    if (!probe.running) {
      return;
    }

    if (!probe.start) {
      probe.start = ts;
      probe.last = ts;
    } else {
      probe.frames.push(ts - probe.last);
      probe.last = ts;
    }

    window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);
})();
`;

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

async function waitForHttp(url, timeoutMs = 20000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.ok || response.status === 304) {
        return;
      }
    } catch (error) {
      // Keep polling until timeout.
    }

    await wait(250);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function startPreviewServer() {
  const child = spawn('npm', ['run', 'preview', '--', '--host', HOST, '--port', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[preview] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[preview] ${chunk}`);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      process.stderr.write(`[preview] exited with code ${code}\n`);
    }
  });

  await waitForHttp(TARGET_URL);
  return child;
}

async function stopServer(child) {
  if (!child || child.killed) {
    return;
  }

  child.kill('SIGTERM');

  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    wait(2500)
  ]);

  if (!child.killed) {
    child.kill('SIGKILL');
  }
}

async function runAccordionScenario(page, sectionSelector, buttonSelector, steps = 3) {
  const toggles = page.locator(`${sectionSelector} ${buttonSelector}`);
  const total = await toggles.count();
  const limit = Math.min(steps, total);

  for (let index = 0; index < limit; index += 1) {
    const toggle = toggles.nth(index);
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click({ force: true });
    await page.waitForTimeout(720);
  }

  if (limit > 0) {
    const lastToggle = toggles.nth(limit - 1);
    await lastToggle.click({ force: true });
    await page.waitForTimeout(640);
  }
}

function summarizeFrames(frames) {
  const sanitized = frames.filter((value) => Number.isFinite(value) && value > 0);
  const sorted = [...sanitized].sort((a, b) => a - b);
  const frameCount = sanitized.length;

  if (!frameCount) {
    return {
      frameCount: 0,
      avgFrame: 0,
      p95Frame: 0,
      maxFrame: 0,
      slowFrames: 0,
      verySlowFrames: 0,
      slowRatio: 0,
      verySlowRatio: 0
    };
  }

  const avgFrame = sanitized.reduce((sum, value) => sum + value, 0) / frameCount;
  const p95Index = Math.min(frameCount - 1, Math.floor(frameCount * 0.95));
  const p95Frame = sorted[p95Index];
  const maxFrame = sorted[frameCount - 1];
  const slowFrames = sanitized.filter((value) => value > 16.7).length;
  const verySlowFrames = sanitized.filter((value) => value > 33.3).length;

  return {
    frameCount,
    avgFrame,
    p95Frame,
    maxFrame,
    slowFrames,
    verySlowFrames,
    slowRatio: slowFrames / frameCount,
    verySlowRatio: verySlowFrames / frameCount
  };
}

async function runProfile(profile) {
  const browser = await profile.browserType.launch({ headless: true });

  try {
    const context = await browser.newContext(profile.contextOptions);
    const page = await context.newPage();

    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(PROBE_SETUP);

    await runAccordionScenario(page, '#program', '.program-card__toggle', 3);
    await runAccordionScenario(page, '#faq', '.faq__question', 3);
    await runAccordionScenario(page, '#team', '.team__expert-summary', 3);

    await page.waitForTimeout(600);

    const raw = await page.evaluate(() => {
      const probe = window.__landingPerfProbe || { frames: [] };
      probe.running = false;
      if (probe.longTaskObserver && typeof probe.longTaskObserver.disconnect === 'function') {
        probe.longTaskObserver.disconnect();
      }

      return {
        frames: Array.isArray(probe.frames) ? probe.frames : [],
        longTasks: Number.isFinite(probe.longTasks) ? probe.longTasks : 0,
        longTaskDuration: Number.isFinite(probe.longTaskDuration) ? probe.longTaskDuration : 0,
        longTaskObserverReady: Boolean(probe.longTaskObserverReady)
      };
    });

    const summary = summarizeFrames(raw.frames);

    await context.close();

    return {
      profile: profile.name,
      ...summary,
      longTasks: raw.longTasks,
      longTaskDuration: raw.longTaskDuration,
      longTaskObserverReady: raw.longTaskObserverReady
    };
  } finally {
    await browser.close();
  }
}

function formatRow(result) {
  return {
    profile: result.profile,
    frames: result.frameCount,
    avg_ms: result.avgFrame.toFixed(2),
    p95_ms: result.p95Frame.toFixed(2),
    max_ms: result.maxFrame.toFixed(2),
    slow_pct: `${(result.slowRatio * 100).toFixed(1)}%`,
    very_slow_pct: `${(result.verySlowRatio * 100).toFixed(1)}%`,
    long_tasks: result.longTaskObserverReady ? result.longTasks : 'n/a',
    long_task_ms: result.longTaskObserverReady ? result.longTaskDuration.toFixed(1) : 'n/a'
  };
}

function isProfileFailing(result) {
  const p95Limit = STRICT_MODE ? 45 : 60;
  const verySlowLimit = STRICT_MODE ? 0.22 : 0.34;
  const maxFrameLimit = STRICT_MODE ? 140 : 220;

  return result.p95Frame > p95Limit || result.verySlowRatio > verySlowLimit || result.maxFrame > maxFrameLimit;
}

async function main() {
  let previewServer = null;

  try {
    if (!EXTERNAL_URL) {
      await runCommand('npm', ['run', 'build']);
      previewServer = await startPreviewServer();
    } else {
      await waitForHttp(TARGET_URL);
    }

    const profiles = [
      {
        name: 'chromium-desktop',
        browserType: chromium,
        contextOptions: {
          viewport: { width: 1440, height: 900 }
        }
      },
      {
        name: 'chromium-iphone13',
        browserType: chromium,
        contextOptions: {
          ...devices['iPhone 13']
        }
      },
      {
        name: 'webkit-iphone13',
        browserType: webkit,
        contextOptions: {
          ...devices['iPhone 13']
        }
      }
    ];

    const results = [];

    for (const profile of profiles) {
      const result = await runProfile(profile);
      results.push(result);
      process.stdout.write(`\n[perf-smoke] ${profile.name} done\n`);
    }

    process.stdout.write('\n[perf-smoke] Summary\n');
    console.table(results.map(formatRow));

    const failing = results.filter(isProfileFailing);

    if (failing.length > 0) {
      const modeLabel = STRICT_MODE ? 'strict' : 'default';
      process.stderr.write(`\n[perf-smoke] ${failing.length} profile(s) exceeded ${modeLabel} thresholds.\n`);
      failing.forEach((item) => {
        process.stderr.write(
          `  - ${item.profile}: p95=${item.p95Frame.toFixed(2)}ms, verySlow=${(item.verySlowRatio * 100).toFixed(1)}%, max=${item.maxFrame.toFixed(2)}ms\n`
        );
      });

      if (STRICT_MODE) {
        process.exitCode = 1;
      }
    }
  } finally {
    await stopServer(previewServer);
  }
}

main().catch((error) => {
  console.error('[perf-smoke] Failed:', error);
  process.exitCode = 1;
});
