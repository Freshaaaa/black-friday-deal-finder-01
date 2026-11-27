// DealHound — Black Friday deal finder for make.fun (Node 22, stdlib only).
//
// The entry is app/index.html: one self-contained page (inline CSS + JS, no
// network, no external libraries) holding 28 real Black Friday / Cyber Monday
// deals the author found and checked on 27 Nov 2026, plus four screenshots in
// screenshots/. This script hands it in: it copies app/ and screenshots/
// next to this file into the output directory and writes dossier.json there
// with the vendored make.fun library.
// vendor/makefun-frontend.ts stays untouched: the scorer rebuilds the
// dossier with its own copy and compares byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The output directory comes from the environment only, never argv[2]:
// the grader runs `node /bot/main.ts` with /bot read-only.

import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
// Screenshots are real renders of app/index.html taken in desktop Chrome
// (1280x800) and at phone size (390x844): overview, the 40%+ filter, an
// "apple" search, and the phone overview. Nothing is a mockup.
const SHOTS = ['1-overview.png', '2-40off.png', '3-search-apple.png', '4-phone.png'];

// Fail fast with a named item instead of handing in a half entry.
function checkInputs(): void {
  const indexPath = join(here, 'app', 'index.html');
  if (!existsSync(indexPath)) throw new Error('app/index.html is missing: ' + indexPath);
  if (statSync(indexPath).size > 1024 * 1024) throw new Error('app/index.html is over the 1 MiB cap');
  const shotsDir = join(here, 'screenshots');
  if (!existsSync(shotsDir)) throw new Error('screenshots/ is missing: hand in 4 PNG screenshots');
  for (const name of SHOTS) {
    const p = join(shotsDir, name);
    if (!existsSync(p)) throw new Error('screenshot is missing: screenshots/' + name);
    if (statSync(p).size > 262144) throw new Error('screenshots/' + name + ' is over the 256 KiB cap');
  }
}

checkInputs();

mkdirSync(join(out, 'app'), { recursive: true });
cpSync(join(here, 'app', 'index.html'), join(out, 'app', 'index.html'));
mkdirSync(join(out, 'screenshots'), { recursive: true });
for (const name of SHOTS) cpSync(join(here, 'screenshots', name), join(out, 'screenshots', name));
console.log(`app/ -> ${join(out, 'app')}`);
console.log(`screenshots/ -> ${join(out, 'screenshots')}`);

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`dossier.json -> ${join(out, 'dossier.json')} (${dossier.length} bytes)`);
