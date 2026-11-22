# Batch 15: Firms tab, application tracker, logo card animations (22 Nov 2026)

Published version 1795359540-1681 of Trading Interview Practice (slug de8dce32-4d6c-47a7-8f8e-df9520f35385). The artifact is private (read: owner).

## What changed
- **Readiness tab renamed to Firms.** Route `#firms` / `#firms-<id>`; old `#readiness…` links are rewritten on load. Tab id changed in `build.py`; `smoke_test.py` updated.
- **Firm guides** (`src/tr_zy_firminfo.jsx`, `TIP_FIRMINFO.INFO`) for Optiver, Jane Street and IMC, each checked 22 Nov 2026:
  - programmes and dates;
  - assessment stage by stage, with buttons to the matching trainers and games;
  - reported interview topics, linked to lessons;
  - sources.
  - Firms with a guide hide the short "Reported process" panel. The other 34 firms still show only their short process list.
- **Application tracker:**
  - Each programme has a status select: Not started, Applied, Online test, Phone round, Final round, Offer, Rejected, Withdrawn. Statuses are saved in progress as `apps["<firm>:<programmeId>"] = { s, t }`.
  - Countdown badges count calendar days to the next upcoming deadline. They show only for "Not started" or untracked programmes, and turn amber at 30 days or fewer and red at 7 or fewer.
  - Deadlines are stored as ISO times in `deadlines[]` on each programme.
  - "Your applications" at the top of the Firms tab lists tracked programmes.
  - Firm cards show the nearest deadline.
- **Firm cards:** the whole top panel is a logo animation unique to each firm (CSS `.lgx-<id>` in `tip.css`, eight `<i>` layers per card). Every copy stays inside the panel. Turned off for reduced motion.
- **Logos:** the user supplied them for a private artifact.
  - They are stored as white-on-transparent masks in `logos/<id>.png` and recoloured to the firm-type colour (blue market maker, green prop, purple hedge fund, amber insurer).
  - These logos are inverted, so the light mark becomes the colour: G-Research, HRT, Keyrock, CTC, Akuna, Belvedere, Marshall Wace, Mako, Rothesay, SIG, Tower, Two Sigma, Wintermute and Brevan Howard.
  - Maven's feather is a lighter tint of the same colour.
  - D. E. Shaw is a wordmark, split into `deshaw_line.png` and `deshaw_text.png` for its animation.
  - The round sphere logo is Graviton's, not D. E. Shaw's.
  - The logos are recoloured derivatives of the firms' marks. If the artifact is ever shared, revisit using them, because of trademark and copyright.
- **Touch keypad:** `TIP_KIT.NumIn` and Intervals use an on-screen keypad on touch devices (`K.Pad`, `K.isTouch`).
- **View-only DB access:** on the first refused write, the app stops writing to the DB and shows "Saved on this device". Progress was already mirrored to localStorage. The patch is in `build.py`.
- **Readiness:** Mental Math Trainer runs score on speed. At Medium, 10 questions a minute is 0 and 35 a minute (70 in 2 minutes) is 100. Easy needs 25% more, Hard 30% less. Wrong answers scale the score down, and trick drills don't count.
- **Session lists:** best and recent sessions show 5 rows on every trainer.

## Tests
- smoke_test: desktop 320 checks, phone 73, PASS.
- Headless video check of all 37 card animations: no page errors.
