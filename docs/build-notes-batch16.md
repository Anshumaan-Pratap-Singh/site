# Build notes batch 16 (22 Nov 2026): firm card animations, round 3

Published version 1795361371-22ea (private, read: owner). Changed only tip.css plus new logo masks. app.js was not republished.

## New masks (art/logos/)
- brevan.png: higher-quality B.
- drw.png: letters only (DR plus three W strokes), 506x156. Third stroke rebuilt from stroke 2.
- maven_v.png and maven_feather.png: the V stroke and the feather on the same 700x700 canvas, so they line up when stacked.
- bell_line.png and bell_band.png: a 600x240 bell curve outline and its ±2σ fill, made in code.

## CSS
- Block marked `/* ===== round 3 (22 Nov)` at the end of tip.css.
- Selectors double the class (`.lgx.lgx-X.lgx-X i:nth-child(k)`, 0,4,1) so older (0,3,1) rules can't leak in. Old leaks included DRW's falling mini logos and Akuna's transform-origin.
- The reset sets transform-origin, filter, box-shadow, mix-blend-mode, clip-path and mask on every child.
- `@property --ga` (an angle) drives the G-Research conic reveal. `@property --yr` (an integer) drives the Man Group year counter.

## Concepts by firm
- Optiver: long-call payoff drawn, logo rides the leg.
- Akuna: rolls in a volatility smile.
- Maverick: candles, then the peaks.
- Maven: the quill writes a line and docks into the V.
- Belvedere: a viewfinder pans the skyline.
- Marshall Wace: LED board prints the mark.
- Wintermute: hex rain, then a scan with a glitch.
- Balyasny: six pods split and regroup.
- CTC: wind gusts and a pinwheel spin.
- G-Research: conic draw of the G, with data points converging.
- Geneva: the Jet d'Eau lifts the logo.
- Jane Street: Figgie suits dealt, then the logo.
- Man Group: 1783 to 2026 counter.
- PEAK6: six peaks.
- QRT: 2x2x2 isometric cube made of logo cubes.
- Squarepoint: crop square locks onto a point.
- Two Sigma: bell curve, ±2σ band, logo at the peak.
- Virtu: globe with fills.
- DRW: D, R, W stamped in turn, then a sheen inside the letters.
- D. E. Shaw: same reveal, but transparent from 94% to 3% of the loop, so it no longer flashes on restart.

## Testing
- /home/claude/grid.py `<ids> <times> <out>` pauses all animations at fixed times and builds a contact sheet.
- Smoke test passed: 320 desktop checks and 73 phone checks.
