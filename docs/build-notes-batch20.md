# Batch 20 (26 Nov 2026): bug sweep fixes

A full bug sweep (headless Chrome at 474, 375 and 1180 px, every page, every question, every trainer and game, coding runs, backup round trip) found 21 bugs. All are fixed here.

## Fixes
1. **Restore Backup kept only solved questions, days, Fermi rounds, game plays and settings.** `tipMergeExtra` (before `function i5`) now merges every other progress field: attempts (newer `t` wins), review queue, lesson bitmasks (OR), mocks (last 50), mistakes (last 400), tracker applications and any other new field. A Daily Challenge run is only copied when none exists here.
2. **Rounded answers rejected.** Tolerances widened so the shown rounding passes: gb-aces-each, wso-three-roll-dice, gb-biased-to-fair, hots-better-of-two, bh-birthday-pairs, wso-sharpe-scaling, wso-real-vs-integer, wso-guess-the-colours, bh-birthday-triplets.
3. **"6.09%" read as 0.0609 on questions asked in percent.** `m5` also accepts an answer ending in % when 100 × the parsed value matches. Applies to the question window, review, practice and mocks.
4. **Market quotes drawn as fractions.** "49 / 51" style quotes now written "49–51" (wso-adverse-selection ×2, wso-mm-100-flips, hots-mm-two-dice, wso-max-three-dice); "50/50" in gb-hats-line is "50–50". Write quotes with an en dash, never a slash.
5. **Reduce Motion left the game-over number at 0.** `anim.js` no longer zeroes `.big` when it will not animate.
6. **SPSC Ring Buffer could not run in C++** (no `std::thread` in the browser compiler). The C++ test is now single-threaded: producer and consumer take turns in random bursts, 100,000 items through a 64-slot buffer, order and sum checked.
7. **Question variety restored** (it was missing from the live app):
   - Sequence Trainer: 15 → 84 rule types (Core rules 21, All rules 61, Bigger steps 80 in use). Sequences that also fit a simpler rule with a different next term are redrawn; numbers up to 9,999 (99,999 at the top level).
   - Probability Trainer: 18 → 79 types, new **Topics** setting (Core 25, Interview 55, Stretch 54, Everything 79). Every new type carries a `sim()` trial; each was checked against 150,000 simulated trials (one wrong answer, E[X³], fixed before publishing).
   - 80-in-8 Mental Maths: new **Question forms** setting (All forms / Fraction → decimal only) and 7 new forms: decimal → fraction, percentage → fraction, mixed → improper, improper → decimal, larger of two fractions, subtraction and division of fractions. Fraction-form answers must be typed with "/".
   - Scale Weights: question type "Every type" (Medium and Hard presets) adds pan totals, differences, heaviest/lightest shape and how many to add to balance; given scales are mirrored and reordered at random; now uses the no-repeat picker.
8. **Two-part questions** now say which part to enter: fifty-little-end (the ratio), bh-total-variance (Var(H)).
9. **Rebuilding could silently drop bundle-only work.** `build.py` refuses to overwrite a bigger live `app.js` (use `--out DIR`, or `--force`). The 26 Nov fixes are in both `src/` and `app.js`. The Batch 19 fixes, the Tracker and the 21 newer firms are still only in `app.js`, so keep editing `app.js` in place for those.
10. **`build.py` left out motion.css / motion.js** from `index.html`; now added. It also creates the `--out` folder.
11. **Live index.html had an extra HTML shell** (from republishing a read_file download). Republished from the repo copy (`lang="en"` back).
12. **Python loader came from jsDelivr.** `pyodide/pyodide.js` (0.26.4) is now stored with the app and loaded from there.
13. Answer parser accepts `√` and `2ln2` (implicit multiplication before ln/log).
14. Very small answers show as e.g. `6.30e-12`, not `0.0000`.
15. Coding Bank subtitle: "both run in your browser".
16. A backup uploaded on the Question Pack tab now says to use Restore Backup.
17. Goldman 2027 EMEA Summer Analyst links to higher.gs.com/campus; "Max 4 applications" moved to "who". BofA IB Summer Analyst (closed 11 Oct) marked closed and linked to campus.bankofamerica.com. Same links fixed in the Tracker rows.
18. Tracker statuses use the current time and refresh when the day changes. The daily firm check now also updates Tracker rows for the firms it checks.
19. Percentages in generated questions drop a trailing ".0" (1%, not 1.0%).
20. Practice order uses one random key per question instead of a random comparator.
21. `smoke_test.py` reports missing local files (HTTP 4xx from the app's own folder).

## Checks
- smoke_test.py PASS (desktop 360 checks, phone 73). gen_test.py PASS for every trainer, preset and topic set.
- All 326 trading questions open with no KaTeX errors and accept their exact value; the nine rounded answers and percent answers now pass.
- Backup → restore in a fresh browser keeps attempts and the review queue.
- SPSC C++ solution 9/9, starter 3/9 (no hang). Python runs with no network access to jsDelivr.

# Android app (26 Nov 2026)

- `android/`: WebView app (package `com.anshumaan.tradingpractice`, launcher name "Trading Practice"), copied from the Maths Workbook app. Pages load from `https://appassets.androidplatform.net/assets/`, so progress stays across updates installed over the old app. `.wasm` is served as `application/wasm` and stored uncompressed.
- Export Backup uses the `WBAndroid.saveFile` bridge (Android save dialog); patch also in `build.py`.
- Icon: `icons/icon-source.svg` (gold scale, the app's A♠ and K♥ cards and dice in the bowls, green/red candles, Maths Workbook navy gradient). Adaptive layers in `android/app/src/main/res/drawable-nodpi`.
- `.github/workflows/android.yml`: push a tag `vX.Y.Z` (or Run workflow) to build, sign and attach `trading-interview-practice-X.Y.Z.apk` to a GitHub Release. Needs repo secrets `KEYSTORE_B64` and `KEYSTORE_PASSWORD` (key alias `tradingpractice`).
- Offline check (all non-local requests blocked): every tab loads, Python 4/4 and C++ 3/3 on Top of Book, Export Backup reaches the bridge. Only Google Fonts is unreachable (falls back to system fonts).
