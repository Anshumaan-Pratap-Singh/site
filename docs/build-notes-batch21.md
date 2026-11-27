# Batch 21 (27 Nov 2026): new Market Games screens

The 11 picked mockups (see claude/ui-mockups-market-games.md) replace the old game screens. Rules, settings, difficulty presets, stats and saved plays are unchanged except where listed.

## How it is built
- `src/tip_g2.jsx.txt`: module `TIP_G2` with the new views (React, JSX compiled with `--jsx-factory=TH`). Each game keeps its own state in its old component and returns `TH(TIP_G2.X, {...})`.
- `src/tip_g2.css.txt`: styles, appended to tip.css between `/* ---- G2 ... */` markers.
- `src/patch_g2.py.txt`: applies everything to app.js and tip.css in place. Each patch must match once. Running it again refreshes the module and the CSS only, so edit the two sources and re-run.

## Picks
Trading Game C (card timeline + position dial), Market Making Dice D (focus, 3D dice, drag line), Event Contracts A (newswire), Market of Cards F (focus; trader names above cards), ETF Arbitrage A (spread meter: green → hatched fee band → red), Card Game A (three desks, keys 1–6 and 0), Betting Board B (scratchpad + stake table), Fermi A (log slider, draggable band; tap to place), Higher or Lower C (run strip; ↑/↓ keys), Odds Betting F (quick fire), Superday A (journey; compact track above each round).

## Behaviour changes
- Buy is green, Sell is red everywhere (`.mm-px.ask` / `.mm-px.bid` swapped in tip.css).
- Card Game: fair value now counts the card just turned (`fair(kk + 1)`); a timeout no longer throws.
- Betting Board: an arbitrage call scores your own stakes if you typed any (scaled down to the budget if over it); empty stakes use the ideal split.
- Odds Betting: four sizes (Pass 0%, Small 2%, Medium 10%, Big 30%), 10 s ring per bet (timeout = pass). Right size = nearest to Kelly; result adds `hits`.
- Higher or Lower: the played card is not repeated as "now"; the bankroll line shows only once it moves.
- MM games no longer focus the bid box on touch devices.
- Mobile: every layout stacks at 900 px and 640 px. Betting Board stake table on phones: fixed columns, Pays column hidden (1.2.1).

## Checks
- smoke_test.py PASS (desktop 360, phone 73).
- Every game played to its results screen at 1280 px; Trading, Card Game and Higher or Lower also at 390 px. No page errors.

## 1.2.2: formula sheet opens fast
- Lessons > Formula sheet rendered all 70 KaTeX lines on every open, and motion.js slid the freshly mounted grid (about 0.8 s at 4× CPU throttle).
- Now: each line is rendered to HTML once (`bg(tex, true)`, cached, warmed with requestIdleCallback); the grid is mounted hidden when the page is idle and stays mounted; open/close is a CSS `grid-template-rows` transition on `.tip-sheet-wrap` (tip.css). `.tip-sheet-grid` removed from motion.js accordion list.
- Toggle now about 0.1 s at 4× throttle (about 8× faster).
