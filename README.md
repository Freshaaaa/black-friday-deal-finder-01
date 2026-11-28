# DealHound — Real Black Friday Deal Finder 2026

[![Black Friday Deal Finder](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/rank/Freshaaaa/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/reward/Freshaaaa/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

A static Black Friday & Cyber Monday deal finder with **28 real deals** found and
checked by the author on Black Friday itself, **27 November 2026**. Every deal shows
its store, sale price, usual price, check time, and an honest verdict — **new low,
strong, solid, weak, mixed, not a discount, or no was-price** — with the evidence
for the call. Search and filters (category, store, minimum discount) all work, on
desktop and on a phone, with no network requests at all.

v2 (28 Nov 2026): a "Top 5 deals — save up to $450" strip ranked by biggest % off,
six stat cards including $4,224 total savings and a 37% average discount, and
much bigger discount badges on every card (50%+ cuts get a solid green pill).

Built for the [make.fun bounty "Build the best real Black Friday deal finder"](https://make.fun/bounty/black-friday-deal-finder-01)
($250, 20 places paid; 1st $50, 2nd $35, 3rd $25).

## What is inside

- `app/index.html` — the whole site in one self-contained file (inline CSS + JS, no
  external libraries, no network). The 28 deals live in the file itself, with their
  store, prices, verdict, evidence and source for each one.
- `screenshots/` — 4 real renders of the site in Chrome: overview, a 40%+ TV filter,
  an "airpods" search, and the phone overview.
- `main.ts` — Node 22 entrypoint: copies `app/` + `screenshots/` to `MAKEFUN_OUTPUT_DIR`
  and writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-frontend.ts` — copied from the kit, unchanged.

## The deals (checked 27 Nov 2026)

Sources: Best Buy's Black Friday release (17 Nov, re-checked 27 Nov), 9to5Toys reports
(20–23 Nov), Benzinga / TradingView (27 Nov), 9to5Google (12 Nov), Xbox Wire (16 Nov),
Apple.com (27 Nov). Highlights:

- **New lows (3):** AirPods Pro 3 — $149 at Amazon (Amazon's lowest ever, per 9to5Toys);
  Google Home Speaker — $79.99 at Best Buy (lowest ever, per 9to5Google); MacBook Air
  M5 — $989 at Amazon (lowest MacBook Air price in the sale).
- **Strong (10):** Beats Studio Pro $99 (−67%, Walmart), Sony WH-1000XM5 $169 (−58%),
  Shark vacuum $199.99 (−60%), Insignia fridge $299.99 (−60%, saves $450), TCL 65" TV
  $229.99 (−51%), Samsung 9100 PRO 2TB $349.99 (−49%), HP OmniBook 5 $449.99 (−44%).
- **Honest flags:** Apple's gift-card event is labelled **not a discount** (full price +
  gift card); four deals where the store shows no regular price are labelled
  **no was-price** instead of getting a discount nobody can verify.

## How to run

```sh
# hand in (writes out/ by default via MAKEFUN_OUTPUT_DIR)
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

# or just open the site directly — it is static files only
open app/index.html
```

Try the filters in the page: search `airpods`, filter category `TVs` with `40%+ off`,
or open `app/index.html?cat=TVs&min=40` and `app/index.html?q=airpods` directly.

Screenshots were taken in headless Chrome 158 from the real page (see `shots.cjs`):
desktop 1280x800 for shots 1–3, phone 390x844 for shot 4, each under 256 KiB.

## License

MIT — see [LICENSE](LICENSE).
