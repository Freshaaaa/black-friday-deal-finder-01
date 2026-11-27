// Take the 4 screenshots for DealHound (real renders of the site's own code).
// Desktop 1280x800 x3, phone 390x844 x1. Each shot loads app/index.html from
// disk (file://) — no network — waits for the JS render, then screenshots.
const puppeteer = require('/home/hatch/workspace/metamask/automation/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SHOTS = [
  { file: 'screenshots/1-overview.png', query: '', w: 1280, h: 800 },
  { file: 'screenshots/2-40off.png', query: '?min=40', w: 1280, h: 800 },
  { file: 'screenshots/3-search-apple.png', query: '?q=apple', w: 1280, h: 800 },
  { file: 'screenshots/4-phone.png', query: '', w: 390, h: 844 },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/hatch/workspace/chrome/opt/google/chrome/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1280,800'],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  for (const shot of SHOTS) {
    await page.setViewport({ width: shot.w, height: shot.h });
    const url = 'file://' + path.resolve(__dirname, 'app/index.html') + shot.query;
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await sleep(900);
    const cards = await page.evaluate(() => document.querySelectorAll('.card').length);
    const count = await page.evaluate(() => (document.getElementById('countline') || {}).textContent || '');
    // Sanity: the render must show cards, never an empty grid on a preset view.
    if (cards === 0) errors.push('ZERO CARDS: ' + shot.file + ' ' + shot.query);
    await page.screenshot({ path: path.resolve(__dirname, shot.file) });
    const bytes = fs.statSync(path.resolve(__dirname, shot.file)).size;
    console.log(shot.file + '  ' + bytes + ' bytes  cards=' + cards + '  | ' + count.trim().slice(0, 90) + (bytes > 262144 ? '  OVER 256 KiB!' : ''));
  }
  console.log(errors.length ? 'JS ERRORS:\n' + errors.join('\n') : 'no JS errors');
  await browser.close();
})().catch((e) => { console.error('SHOTS CRASH:', e.message); process.exit(1); });
