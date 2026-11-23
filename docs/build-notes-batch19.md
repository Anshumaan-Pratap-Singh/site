# Batch 19 (22–23 Nov 2026): Tracker sub-tab, 21 new firm cards

- Firms tab has a Tracker sub-tab (UK spring weeks and summer internships by firm type, filters, layouts).
- 21 new firm cards and guides: Citadel, Capula and 19 banks' markets divisions (new type "Bank", crimson `--k6`).
  Guides are in `src/tr_zy_firminfo3.jsx.txt`; animations are the `nc-*` keyframes and `.lgx-<id>` rules at the end of `tip.css`;
  masks in `logos/<id>.png` and split pieces in `logos/fx/<id>_*.png`.
- Loop fix (23 Nov): wipe/scale layers stay at opacity 0 until their reveal starts, so nothing flashes at the loop restart.
- Note: `app.js` here was patched directly (tracker and Firms changes were made on the bundle), so rebuilding from `src/`
  alone does not yet reproduce it. Edit `app.js` in place for small data changes until the sources are brought in line.
