# Batch 14: Mental Math Trainer merged into Trading Interview Practice (22 Nov 2026)

Published version 1795347387-2718 of Trading Interview Practice (slug de8dce32-4d6c-47a7-8f8e-df9520f35385). Follow-ups below are in later versions.

## What changed
- **New trainer `mmt`** (Trainers → Mental Maths, first entry). Uses the shared TIP.Setup screen.
  - `src/tr_mmt0_engine.jsx`: the old Mental Math Trainer engine, copied verbatim and wrapped as `MMT_ENGINE`.
  - `src/tr_mmt1_trainer.jsx`: `TIP_MMT` with flat settings (mode, types, ops, duration, target, hard, number ranges), Easy/Medium/Hard/Custom presets, OA-console game, review with mistake tags, Speed and Accuracy charts.
  - `TIP_MMT.drill(cfg)` opens the trainer with a preset config (used by lessons). Pending config is passed via `TIP.pending`.
- **tip_core.jsx**: new field type `multi` (chips), `customOnly`/`presetOnly` fields, info tiles, `game.check` validation message.
- **Lessons**: new group "Mental maths tricks" (`src/learn_p4.js`, 9 lessons: tx11, td11, td9, td99, tx5, tx25, tx125, tsq5, tpct). Each has a "Drill this" button where a drill exists.
  - Modular arithmetic lesson: removed the 3/9 digit-sum rule and the 11/99 shortcuts (now a pointer to the tricks lessons). The "mental" lesson lost its overlapping tricks.
- **Readiness**: arithmetic stage now includes `mmt`.

## Follow-ups (same day)
- Version 1795348232-e7e8: every trainer's "Your best sessions" shows the top 5 and "Recent sessions" the last 5 ("Show all" kept). Change is in `tip_core.jsx`.
- Version 1795348753-7ba2: Readiness scores Mental Math Trainer runs on speed, not accuracy (timed mode never marks answers wrong, so accuracy was always 100).
  - Rule (`OVER.mmt` in `tr_zz_ready.jsx`): at Medium/Custom, 10 questions a minute = 0 and 35 a minute (70 in 2 min) = 100. Easy needs 25% more, Hard 30% less. Multiplied by correct ÷ (correct + wrong). Trick drills (mode "tricks") are not counted.
  - User's data: Mental arithmetic area went from 100 to 49.
  - The "How it's graded" panel explains the rule.

## Data port
- The old trainer's 25 runs (17–22 Nov) were written as summary records to the TIP DB doc `data/users/<uid>/mmtImport`.
- `TIP_MMT.Migrate` merges them once into progress (`games.mmt.plays`, dedupe by ts) and sets `progress.mmtImported`.
- Imported avg time is 120 s ÷ correct (close to exact). First-try rate is not available for imported runs.
- Runs played in the old trainer after 22 Nov 11:00 are not copied.

## Old artifact
- Mental Math Trainer (slug 5c56c922-…) now shows a banner pointing to Trading Interview Practice → Trainers (version 1795346936-1fa6).

## Tests before each publish
- smoke_test: desktop 320 checks, phone 73, 0 problems. gen_test PASS. play.py 0 errors. Local screenshot run of the trainer: 0 errors.
