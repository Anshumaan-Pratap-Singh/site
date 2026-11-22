# Trading Interview Practice: court cards (22 Nov 2026)

Published as version 1795339692-0e4e ("English pattern court cards (Fomin, CC0)").

## What changed
- J/Q/K in every game now use Dmitry Fomin's English pattern figures (Wikimedia Commons, CC0 1.0), traditional palette (crimson #B5122E, royal blue #1D3F94, gold #E9B824, ink #111111) on white card.
- Figures live in `cards/court/<rank><suit>.svg` (J/Q/K × S/H/D/C, ~130–185 KB each, viewBox 0 0 150 258 = the court panel). Provenance and edits in `cards/court/SOURCES.md`.
- `src/tip_deck.jsx`: the hand-drawn `CourtHalf` / `LOOK` code was removed. `Face` draws the white panel, an `<image href="cards/court/…">` and the 2.5 px panel frame; corner indices unchanged. `warmCourts()` preloads the 12 files on idle so the first flip shows the figure.
- Figure prep: kept only the figure (removed card background, Fomin's frame and middle line, corner indices, large inner suit marks); frame interior 30..330 × 30..510 of the 360 × 540 originals mapped onto 150 × 258 (≈7% sideways squeeze, no crop, runs under the panel frame so no gap).
- Source files came from GitHub mirrors (Luuk1983/Umbraco.Community.UmbraDesktop art/fomin, which records the CC0 check per file), because Wikimedia is blocked from the build workspace.

## Build / test notes
- Rebuilding the previous live version with esbuild 0.21–0.28 differed from live `app.js` by 2 bytes only (redundant parentheses in the old court code, hand-edited earlier); that code is now gone.
- `src/smoke_test.py` is out of date with the current UI: the Lessons "Done" status filter and the list sort buttons (A–Z, etc.) no longer match, so it fails on the old live version too. A trimmed run (all tabs, question modal, every lesson page, every trainer and Market Game started, desktop + phone, plus a check that every `cards/court/*` request returns 200) passed: desktop 118 checks, phone 28 checks, 0 problems. Higher or Lower showed the J♦ figure correctly.
- Other sets prepared but not in the game: Fomin Atlas (Russian) figures, Kennard/CardMeister (CC0), Knoll (public domain).
