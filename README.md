# 臺南 ⇄ 臺北 train planner

A small web page that combines **Taiwan Railway (TR)** and **High Speed Rail (HSR)**
into through-trips between Tainan and Taipei.

- **Tainan → Taipei:** TR Tainan → Shalun, then HSR Tainan → Taipei
- **Taipei → Tainan:** HSR Taipei → Tainan, then TR Shalun → Tainan

Pick the travel day and earliest departure; the page lists every trip after it, 4 per page, each
first-leg train paired with the first connection leaving at or after it arrives
(0-minute change at Shalun). The fastest trip on each page is highlighted.
"Add to Google Calendar" opens Google Calendar with the trip filled in (both trains,
times in Taiwan time); you tap Save and buy the tickets yourself.

Everything runs in the browser: no server, and it works offline once installed.

## Use it

- **On Windows:** double-click `Open planner.bat` in the project folder (or `site/index.html`).
- **On Linux:** double-click `Open planner.desktop`. The first time, make the launchers
  runnable: `chmod +x "Open planner.desktop" "Open planner.sh"`; on GNOME also right-click
  the .desktop file → **Allow Launching**. From a terminal: `./"Open planner.sh"`.
- **On an Android phone:** host the `site/` folder (below), open the address in
  Chrome, then menu → **Add to Home screen / Install app**.

## Host it (free)

Upload the `site/` folder as-is to a static host, e.g. drag it onto
https://app.netlify.com/drop (Cloudflare Pages and GitHub Pages also work).
It must be served over HTTPS for "Install app" and offline use to work.

## Project layout

```
site/          the planner (upload this folder as-is)
  index.html     page, styles, station names, booking links, calendar button
  matcher.js     trip-matching rules (TRANSFER_MIN, directions)
  data.js        generated from timetables/*.json - do not edit
  sw.js, manifest.webmanifest, icon-*.png   install and offline support
timetables/    timetable data
  *.json         parsed timetables the planner uses
  source/        original PDFs
scripts/       tools to refresh the timetables
```

## Update the timetables

The schedules are assumed constant. When new PDFs arrive:

1. Replace the PDFs in `timetables/source/` (keep the same file names).
2. `pip install -r requirements.txt` (first time only).
3. `python scripts/parse_tr.py` and `python scripts/parse_hsr.py`
   → `timetables/*.json`. Check the printed counts (TR about 36/37, HSR 73/73).
4. `python scripts/build_site.py` → rebuilds `site/data.js` and bumps the offline
   cache so installed phones update.
5. Re-upload `site/`.

To change the minimum change time at Shalun, edit `TRANSFER_MIN` in `site/matcher.js`,
run step 4, and re-upload.
