# 臺南 ⇄ 臺北 train planner

A small web page that combines **Taiwan Railway (TR)** and **High Speed Rail (HSR)**
into through-trips between Tainan and Taipei.

- **Tainan → Taipei:** TR Tainan → Shalun, then HSR Tainan → Taipei
- **Taipei → Tainan:** HSR Taipei → Tainan, then TR Shalun → Tainan

Pick the travel day and earliest departure; the page lists every trip after it, 4 per page, each
first-leg train paired with the first connection leaving at or after it arrives
(0-minute change at Shalun). The trip with the shortest travel time on each page is highlighted in red.
"Add to Google Calendar" opens Google Calendar with the trip filled in (both trains,
times in Taiwan time); you tap Save and buy the tickets yourself.
Pull down at the top of the page to refresh.

Everything runs in the browser: no server, and it works offline once installed.

## Use it

- **On Windows:** double-click `Open planner.bat` in the project folder (or `site/index.html`).
- **On Linux:** double-click `Open planner.desktop`. The first time, make the launchers
  runnable: `chmod +x "Open planner.desktop" "Open planner.sh"`; on GNOME also right-click
  the .desktop file → **Allow Launching**. From a terminal: `./"Open planner.sh"`.
- **On a phone:** scan the QR code below (or open
  https://yukunlin1124.github.io/taipei-tainan-planner/), then in Chrome
  menu → **Add to Home screen / Install app** so it opens with one tap, even offline.

  <img src="qr.png" alt="QR code for the planner" width="200">

## Hosting

GitHub Pages publishes `site/` automatically on every push to `main`
(`.github/workflows/pages.yml`). One-time setup: repository **Settings → Pages →
Source: GitHub Actions**. Any other static HTTPS host also works with `site/` as-is.

## Project layout

```
site/          the planner (published to GitHub Pages)
  index.html     page, styles, booking links, calendar button
  matcher.js     trip-matching rules, directions, station names
  data.js        generated from timetables/*.json - do not edit
  sw.js, manifest.webmanifest, icon-*.png   install and offline support
timetables/    timetable data
  *.json         parsed timetables the planner uses
  source/        original PDFs
scripts/       tools to refresh the timetables, build the site, make the QR code
qr.png         QR code that opens the published planner (scripts/make_qr.py)
```

## Update the timetables

The schedules are assumed constant. When new PDFs arrive:

1. Replace the PDFs in `timetables/source/` (keep the same file names).
2. `pip install -r requirements.txt` (first time only).
3. `python scripts/parse_tr.py` and `python scripts/parse_hsr.py`
   → `timetables/*.json`. Check the printed counts (TR about 36/37, HSR 73/73).
4. `python scripts/build_site.py` → rebuilds `site/data.js` and bumps the offline
   cache so installed phones update.
5. Commit and push; GitHub Pages republishes the planner.

To change the minimum change time at Shalun, edit `TRANSFER_MIN` in `site/matcher.js`,
run step 4, then commit and push.
