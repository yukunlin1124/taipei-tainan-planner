# Tainan ⇄ Taipei train planner

Static web page (no server) that pairs Taiwan Railway (TR) and High Speed Rail (HSR)
trains into Tainan ⇄ Taipei trips, via Shalun / HSR Tainan. See README.md.

## Where things live

- Trip-matching rules (pairing TR and HSR legs, TRANSFER_MIN, directions): `site/matcher.js`
- Station names and booking links shown to the user: `site/index.html` (STATION, BOOK)
- Page design, travel day and the Add to Google Calendar button: `site/index.html`
- Timetables: `timetables/*.json` (parsed, what the planner uses);
  source PDFs in `timetables/source/`
- Re-parse PDFs: `scripts/parse_tr.py` (OCR, image PDFs), `scripts/parse_hsr.py` (text PDF);
  then `scripts/build_site.py`
- The planner people open: `site/` (static), published by `.github/workflows/pages.yml`
  to https://yukunlin1124.github.io/taipei-tainan-planner/ ; `qr.png` points there
- Generated, do not edit: `site/data.js` (from `timetables/*.json` by `scripts/build_site.py`)
- Skip when searching: `.scratch/`, `__pycache__/`, `*.log`, `timetables/source/*.pdf` (binary)

## Conventions

- After changing anything in `site/` or `timetables/`, run `python scripts/build_site.py`
  so `site/data.js` and the offline cache name in `site/sw.js` are refreshed.
- Times are "HH:MM" 24-hour strings in data; the page shows them as 12-hour AM/PM.
