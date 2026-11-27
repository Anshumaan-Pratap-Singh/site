# Trading Interview Practice: build notes

Artifact: https://claude.ai/artifact/UUx8zPYjNSyUsGsGBxeTRv (renamed from Tradermath, 18 Nov 2026)
Mental Math Trainer: https://claude.ai/artifact/CQLiqegPKZ55PPjV9AV3GW (separate, single index.html, React + Recharts from jsDelivr)

## How to build and test (since 19 Nov, one script does everything)
1. Download the artifact files (the `src/*.txt` copies are the sources; `src/base-app.js` and `src/base-index.html` are the original Tradermath bundle).
2. `python3 src/build.py --esbuild <path to esbuild> [--out DIR]` (copy `src/build.py.txt` to `src/build.py` first). It reads `src/<name>` or falls back to `src/<name>.txt`, compiles every JSX module, applies every patch (each must match exactly once or the build stops) and writes `app.js` and `index.html`. The dashboard (`src/tip_dash.js.txt` replaces `function em`), the learning hooks and the extra Fermi facts (`src/fermi_more.py.txt`) are all part of it; `patch_learn.py` was removed. On 19 Nov the rebuilt `app.js` was byte-identical to the live one before any new change was made.
3. `python3 src/smoke_test.py [ARTIFACT_ROOT] [--quick]` (copy from `src/smoke_test.py.txt`; needs Playwright + Chromium). It serves the folder, then at desktop size opens every tab, every lesson page, every trainer and Market Game (presses Start Game and waits through the 3-2-1 countdown), a question modal, and the search/filter/sort controls; at phone size it repeats a sample. Fails on any page error, console error, error screen or empty screen. Exit 0 = PASS. Run before every publish (about 4 minutes).
4. `python3 src/gen_test.py [ARTIFACT_ROOT] [samples]` (from `src/gen_test.py.txt`). Samples every question generator of the variety trainers for each preset and topic set: no exceptions, the stated answer is accepted by the question's own check, no NaN/undefined text, choice questions have exactly one right option, and for sequences no simpler rule (constant gap, ratio or second gap) fits the shown terms with a different next term. Prints kinds and distinct questions per config.
- Compile flags: esbuild `--loader=jsx --jsx-factory=TH --jsx-fragment=TF --target=es2020 --charset=utf8`. Styles go in `tip.css` (blocks in order: Batch 6 phone fixes, Batch 5 lesson and case styles, countdown, dashboard, learning, search + filters, fraction forms).

## Modules (src/*.jsx.txt)
- `tip_core`: the shared trainer/game screen `TIP.Setup` (Settings with Easy/Medium/Hard/Custom, Statistics with hover line charts, optional Progress charts via `def.charts`, "Your best sessions" top 10, "Recent sessions" with per-session delete, clear history), `TIP.LineChart`, `TIP.useNow`, `TIP.adaptGames` (moves the older Market Games onto the shared screen), `TIP.FilterBar` (search box + chip rows + count + Clear filters, same look as the Trading Questions bar), `TIP.useFilters(key, defaults)` (filter state kept per list for the visit) and `TIP.matches(query, ...texts)` (every word must appear; accents and dashes normalised). `def.fmtVal` overrides how a score is shown; `def.splitBy` keeps separate stats per value of a setting; `def.metricOf(settings)` picks score or P&L.
  - Every run opens with the 3-2-1 "Get ready" countdown (`.tip-cd`), Esc or Cancel goes back to Settings. The game component only mounts when the countdown ends. Test scripts wait about 3.5 s after Start.
- `tip_trading`: the reworked Trading Game. Plays saved with `v: 2` under game id `trading`; only v2 plays count in stats.
- `tip_trainers`: Trainers tab and Market Games list (sections, cards with animated SVG art, `TIP_TRAINERS.register(def)`). Both lists share `ListView`: search (name, description, section), Section filter, Status (All / Played / Not played) and Sort (By section / A–Z / Most played / Recently played, using play `ts`). Any sort other than By section shows one flat grid.
- `tip_drill`: shared question/answer engine (`TIP_DRILL.trainer`, `TIP_DRILL.course`, `bs`, `ncdf`, `fresh`). Trainers with `spec.variety = true` (Sequence, Probability, Fractions, Scale Weights, Options, Futures, Prediction Markets) get questions through `fresh()`: it draws 14 candidates, drops any whose text was already asked this session or whose kind (the part before ":") equals the previous question's, then picks the kind seen least recently. Last-seen times per kind are kept in localStorage `tip-seen-<trainer id>` (capped at 600 keys). Games that control their own order (Task Switch, Response Conflict, memory games) don't opt in. Simulation of 5 × 30-question sessions per preset: 0 repeats within a session, 0 same type back to back, every kind came up.
- `tip_learn` + `learn_data`: attempt tracking, review queue, mock interviews, Lessons tab, Glossary, dashboard panels. Lessons list has search (title, group, body, example, tags), Group filter (8 groups) and Status (Not started / In progress / Done from the quick-check bitmask). The filter hook sits before the lesson-page early return so hook order never changes.
- `tr_00shapes`, `tr_<id>` (one per trainer; build picks up `tr_*.jsx` automatically).
- `window.__TIP` exposes TIP, TIP_TRAINERS, TIP_DRILL, TIP_LEARN, jt for headless tests.
- Saved progress keys (`tradermath-*` in localStorage) are unchanged on purpose.

## Question variety (19 Nov)
- Sequence Trainer: 13 → 79 pattern types (Basic 22, Mixed 41, Advanced 53 in use). Ambiguous sequences are rejected in the generator (falls back to a plain step if nothing fits). Advanced allows numbers up to 99,999.
- Probability Trainer: 18 → 77 question types (Core 29, Interview 40, Stretch 36). New answers checked against brute force or simulation (39 kinds, 975 sampled questions, all matched); the simple-formula ones were checked by reading samples.
- Options drills 9 → 25 types, Futures 6 → 20, Prediction Markets 6 → 20; topic sets extended.
- Fractions: new setting "Question forms" (All forms / Fraction → decimal only; presets use All). New forms: decimal → fraction, percentage → fraction, mixed → improper, improper → decimal, compare two fractions, fraction of a number, percentage of a number, add/subtract fractions. Fraction answers must be typed with "/" (equivalent fractions accepted).
- Scale Weights: new types total, difference, heaviest/lightest (no weights given), how many to add to balance; pans may be mirrored and scales shown out of order (3+ shapes).
- Fermi (Market Games): 32 → 211 facts from `src/fermi_more.py.txt` (each row has a source note). Time-sensitive ones were web-checked on 19 Nov: FX turnover $9.6tn (BIS 2025), UK GDP £2,905bn (ONS Blue Book 2026), 21 euro countries, Tube 272 stations / 402 km, Great Wall 21,196 km, UN WPP 2024 populations, Canada 41.65m (StatCan), Coventry 345,300, Birmingham 1,144,900, marathon WR 1:59:30 (2026), English Wikipedia 7.2m. Each game takes the least recently seen facts first (localStorage `tip-seen-fermi`).

## Navigation
Dashboard, Trading Questions, Coding Bank, Lessons, Trainers, Market Games, Glossary.

## Dashboard
- Problems Solved ring split by problem type in a fixed colour order (`--tip-c1`…`--tip-c6`), toggleable key saved in `tip-dash-hidden`. Phones: 2×2 grid.
- Under the stats: Review queue card, Mock interview card, Weakest areas (bottom 3 by problem type and by technique).

## Attempt tracking, review, mock (`tip_learn`)
- Stored in the synced progress object: `att[id] = { g, n, t, h, s }`, `rev[id] = { s, d }`, `les[lessonId]` (bitmask), `mocks[]` (last 50).
- Grades: Clean / Hinted / Missed; proof questions self-rated. Review: Hinted or Missed → tomorrow; Clean → +3, +7 days, then removed.
- Weak areas need 3+ answered questions. Mock interview: 5/10/15 questions, 15/30/45 min, numeric questions only.

## Lessons tab
- 36 lessons in 8 groups, worked example + two quick checks each, formula sheet card, linked bank questions by tags. Route `#lessons-<id>`.

## Glossary tab
- 108 terms, A–Z jump links, search.

## Question bank
- `data/trading.json` is fetched at runtime. IDs must stay unique; progress is keyed by ID. Question `tags` drive lesson links and technique weak areas. Answer check is absolute: |input − value| ≤ tolerance (default 0.1% of value). Use about 5e-4 for non-terminating fractions so 3-decimal entries pass.
- 19 Nov: 128 → 293 (+165 from Green Book, AMC/AIME, Blitzstein & Hwang, Fifty Challenging Problems, Putnam, Heard on the Street).
- 19 Nov (later): +33 WSO questions → 326 total, 52 WSO. Each traced to a WSO thread: S&T Brain Teasers, S&T quantitative interview questions, The Massive List of Trading/Quant Questions (SIG, Jane Street, Citadel, Goldman), Jane Street Quant Interview Questions, Jane Street Teaser Q, "A different make me a market question", Some interview questions, Brain teasers – Examples, SIG Research Associate, Hardest Probability and Statistics Interview Questions, Brainteasers from recent interview, "Did I completely screw up my first interview brainteaser?". All rewritten in our own words, answers checked by code, LaTeX rendered with KaTeX using the app's own `$` splitting rules, every question opened in the app and its answer accepted.
- Left out as near-duplicates of existing questions: 100 quarters / double-headed coin, dice re-roll option value, lions and sheep, three switches, salary averaging, handshakes, airplane seat, clock at 3:15, St Petersburg coin game, auditorium (Monty Hall), √1000, race to 60, meteor in 30 minutes (= cars on the highway), coin flipped 3 times given one head (= boy or girl), 100 flips even heads (Putnam 2001 A2). Left out as too ambiguous or incomplete in the thread: 15 people and 4 doors, bus tokens, special dollar, 5 cards in order.
- WSO pages often refuse direct fetching; the Massive List was read via its identical cross-post on QuantNet and WSO search snippets.

## Batch plan
1–10 done 18–19 Nov (rename, Trading Game, trainers, course trainers, polish, countdown, +165 questions, dashboard, learning features).
11. Build safety (unified build.py, verified identical), smoke tests, search + filters on Lessons / Trainers / Market Games, +33 WSO questions (done 19 Nov).
12. Question variety: many more types in Sequences, Probability, the three course drills, Fractions and Scale Weights; 211 Fermi facts; shared no-repeat picker; gen_test.py (done 19 Nov).
ETF Market Making and Fermi Questions were dropped from Trainers; ETF Arbitrage and Fermi stay in Market Games. All 27 trainers are live.

## Accounts and sync plumbing (27 Nov 2026)
- Firebase project `trading-practice-aps`. `cloud.js` is built from `src/tip_cloud.src.js.txt` with esbuild
  (`--bundle --minify --format=iife --target=es2020`, needs the `firebase` npm package, v11) and loaded before `app.js`.
- It defines `window.tipCloud` outside Claude: `conn()` gives the storage layer (n5 in app.js) a database with the same
  `doc(path).get/set/delete` calls as Claude's, stored in Firestore at `users/{uid}/docs/{name}` as `{ json, ts }`.
- Loading merges this device's copy (`tradermath:progress`) into the account's copy with `i5` (the backup-import merge);
  saving `progress` merges any newer copy from another device in a transaction. Coming back online, or back to the
  app, sends the device's latest progress the same way.
- The small per-device keys `tip-lessons-*`, `tip-seen-*` and `tip-ready-stars` sync through the `small` document
  (arrays union, objects keep the larger number, otherwise newest wins). Theme and layout choices stay per device.
- Signing out removes the account's copy from the device.
- No sign-in screens yet: `tipCloud.signIn / signUp / resetPassword / resendVerification / checkVerified / google /
  signOut` are there for them. Until someone signs in, the app saves on the device exactly as before.
- Android: `WBAndroid.googleSignIn()` (Credential Manager, web client 671680895091-olrct43e…) hands a Google ID token
  back to `window.wbGoogleIdToken`.
- The app.js hooks are in `src/patch_cloud.py.txt` (applied to the live app.js) and in build.py section 9.
