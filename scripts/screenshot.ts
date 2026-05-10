import { chromium } from 'playwright';
import path from 'path';

const BASE = 'http://localhost:3001';
const OUT = path.resolve(__dirname, '../docs/screenshots');

const pages = [
  { name: 'editor', path: '/', waitFor: '.mde-text' },
  { name: 'ai-news', path: '/ai-news', waitFor: 'h1' },
  { name: 'calendar', path: '/calendar', waitFor: 'h1' },
  { name: 'settings', path: '/settings', waitFor: 'h1' },
];

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  for (const p of pages) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle' });
    try {
      await page.waitForSelector(p.waitFor, { timeout: 10000 });
    } catch {
      // fallback: wait a bit
      await page.waitForTimeout(3000);
    }
    // extra settle time for animations
    await page.waitForTimeout(1000);
    const filePath = path.join(OUT, `${p.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`✓ ${p.name} → ${filePath}`);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
