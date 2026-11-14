# Tainan ⇄ Taipei train planner

Static web page (no server) that pairs Taiwan Railway (TR) and High Speed Rail (HSR)
trains into Tainan ⇄ Taipei trips, via Shalun / HSR Tainan. See README.md.

## Where things live

- Trip-matching rules (TRANSFER_MIN, directions, station names in zh/en, route labels):
  `site/matcher.js`
- Booking links, page design, travel day, the Add to Google Calendar button,
  pull-to-refresh and the light/dark theme (colours in `:root` and `[data-theme="dark"]`,
  choice in localStorage `planner.theme`): `site/index.html`
- Timetables: `timetables/*.json` (parsed, what the planner uses); source PDFs in `timetables/source/`
- Re-parse PDFs: `scripts/parse_tr.py` (OCR, image PDFs), `scripts/parse_hsr.py` (text PDF);
  then `scripts/build_site.py`
- The planner people open: `site/` (static), published by `.github/workflows/pages.yml`
  on every push to main
- Planner address and QR code: `scripts/make_qr.py` (URL) → `qr.png`
- Open on a PC: `Open planner.bat` (Windows), `Open planner.desktop` / `.sh` (Linux)
- Generated, do not edit: `site/data.js`, the `CACHE` and `SHELL` lines in `site/sw.js`
  (all by `scripts/build_site.py`), `qr.png` (by `scripts/make_qr.py`)
- Skip when searching: `.scratch/`, `__pycache__/`, `*.log`, `timetables/source/*.pdf`,
  `*.png`, `*.ico` (binary)

## Conventions

- After changing anything in `site/` or `timetables/`, run `python scripts/build_site.py`
  so `site/data.js` and the offline cache in `site/sw.js` are refreshed.
- Times are "HH:MM" 24-hour strings in data; the page shows them as 12-hour AM/PM.
