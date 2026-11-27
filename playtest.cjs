// Playtest DealHound: drive the real page in headless Chrome and assert the
// search + filters behave. Exit 0 only when every check passes.
const puppeteer = require('/home/hatch/workspace/metamask/automation/node_modules/puppeteer-core');
const path = require('path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
function check(name, got, want) {
  const ok = got === want;
  if (!ok) failures++;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + ' — got ' + JSON.stringify(got) + ', want ' + JSON.stringify(want));
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/hatch/workspace/chrome/opt/google/chrome/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, 'app/index.html'), { waitUntil: 'load' });
  await sleep(500);

  const cards = () => page.evaluate(() => document.querySelectorAll('.card').length);
  const countText = () => page.evaluate(() => document.getElementById('countline').textContent);

  check('default shows 28 cards', await cards(), 28);
  check('default countline mentions 28 of 28', (await countText()).includes('28 of 28'), true);

  // Category chip: TVs -> 6
  await page.evaluate(() => { [...document.querySelectorAll('#cats .chip')].find(b => b.dataset.cat === 'TVs').click(); });
  await sleep(200);
  check('TVs chip shows 6 cards', await cards(), 6);

  // Back to All, then store dropdown: Amazon -> 6 (MacBook Air, AirPods Pro 3,
  // Watch S12, iPad mini, LEGO, Samsung 9100 PRO)
  await page.evaluate(() => { [...document.querySelectorAll('#cats .chip')].find(b => b.dataset.cat === 'All').click(); });
  await page.select('#store', 'Amazon');
  await sleep(200);
  check('Amazon store shows 6 cards', await cards(), 6);

  // Min discount 50% -> 6 (Beats Studio 67, XM5 58, Beats Solo 60, Shark 60,
  // Fridge 60, TCL 65 51). Beats Solo 4 at 60% and TCL 65 at 51% included.
  await page.select('#store', 'All');
  await page.evaluate(() => { [...document.querySelectorAll('.minrow .pill')].find(b => b.dataset.min === '50').click(); });
  await sleep(200);
  check('50%+ filter shows 6 cards', await cards(), 6);

  // Search "shark" -> 1
  await page.evaluate(() => { [...document.querySelectorAll('.minrow .pill')].find(b => b.dataset.min === '0').click(); });
  await page.type('#q', 'shark');
  await sleep(200);
  check('search shark shows 1 card', await cards(), 1);

  // Nonsense search -> empty state with a clear button
  await page.evaluate(() => { document.getElementById('q').value = ''; });
  await page.type('#q', 'zzzznope');
  await sleep(200);
  const empty = await page.evaluate(() => !!document.querySelector('.empty'));
  check('nonsense search shows empty state', empty, true);
  await page.evaluate(() => document.getElementById('clearBtn').click());
  await sleep(200);
  check('clear restores 28 cards', await cards(), 28);

  // Sort by lowest price: first card must be the cheapest deal ($79.99 Beats Solo 4)
  await page.select('#sort', 'price');
  await sleep(200);
  const first = await page.evaluate(() => document.querySelector('.card h2').textContent);
  check('lowest-price sort leads with Beats Solo 4', first, 'Beats Solo 4 Headphones');

  // Every card has a store link and a source link, and a verdict badge
  const links = await page.evaluate(() => {
    const cs = [...document.querySelectorAll('.card')];
    return {
      allHaveShop: cs.every(c => c.querySelector('a.btn.go')),
      allHaveSrc: cs.every(c => c.querySelector('a.btn.src')),
      allHaveVerdict: cs.every(c => c.querySelector('.verdict')),
      allHaveMeta: cs.every(c => c.querySelector('.meta') && c.querySelector('.meta').textContent.includes('27 Nov 2026')),
    };
  });
  check('every card has a shop link', links.allHaveShop, true);
  check('every card has a source link', links.allHaveSrc, true);
  check('every card has a verdict badge', links.allHaveVerdict, true);
  check('every card shows check date 27 Nov 2026', links.allHaveMeta, true);

  check('no JS page errors', errors.length, 0);
  await browser.close();
  console.log(failures === 0 ? 'PLAYTEST ALL PASS' : 'PLAYTEST ' + failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error('PLAYTEST CRASH:', e.message); process.exit(1); });
