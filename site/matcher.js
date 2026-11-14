// Combined TR + HSR trip matcher: the one home of the trip-matching rules,
// the directions (route names, legs) and the station names shown on the page.
//
// Tainan -> Taipei : TR Tainan->Shalun, then HSR Tainan->Taipei.
// Taipei -> Tainan : HSR Taipei->Tainan, then TR Shalun->Tainan.
// Each first-leg train is paired with the earliest second-leg train that
// departs at/after it arrives (plus TRANSFER_MIN).
(function (root) {
  const TRANSFER_MIN = 0; // minimum change time at Shalun <-> HSR Tainan

  // Station key (used in DIRECTIONS and trip legs) -> [Chinese, English] display name.
  const STATION = {
    'Tainan': ['臺南', 'Tainan'],
    'Shalun': ['沙崙', 'Shalun'],
    'Tainan (HSR)': ['高鐵臺南', 'HSR Tainan'],
    'Taipei': ['臺北', 'Taipei'],
  };

  // leg: [timetable file in timetables/, system, from station, to station]
  const DIRECTIONS = {
    south_to_north: {
      label: 'Tainan → Taipei',
      from: ['臺南', 'Tainan'], to: ['臺北', 'Taipei'],
      via: 'Taiwan Railway to Shalun, then High Speed Rail from HSR Tainan.',
      leg1: ['tr_tainan_shalun', 'TR', 'Tainan', 'Shalun'],
      leg2: ['hsr_tainan_taipei', 'HSR', 'Tainan (HSR)', 'Taipei'],
    },
    north_to_south: {
      label: 'Taipei → Tainan',
      from: ['臺北', 'Taipei'], to: ['臺南', 'Tainan'],
      via: 'High Speed Rail to HSR Tainan, then Taiwan Railway from Shalun.',
      leg1: ['hsr_taipei_tainan', 'HSR', 'Taipei', 'Tainan (HSR)'],
      leg2: ['tr_shalun_tainan', 'TR', 'Shalun', 'Tainan'],
    },
  };

  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const dur = (dep, arr) => { const d = toMin(arr) - toMin(dep); return d < 0 ? d + 1440 : d; };

  // A train with "days" (e.g. ["Fri", "Sun"]) runs only on those weekdays; without it, daily.
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];   // Date.getDay() order
  const runsOn = (r, weekday) => !weekday || !r.days || r.days.includes(weekday);

  // weekday: 'Mon'..'Sun' to keep only trains running that day; omit to ignore operating days.
  function match(tables, direction, startTime, transfer = TRANSFER_MIN, weekday = null) {
    const cfg = DIRECTIONS[direction];
    const [f1, s1, from1, to1] = cfg.leg1;
    const [f2, s2, from2, to2] = cfg.leg2;
    const byDep = (a, b) => toMin(a.dep) - toMin(b.dep);
    const leg1 = tables[f1].filter(r => runsOn(r, weekday)).sort(byDep);
    const leg2 = tables[f2].filter(r => runsOn(r, weekday)).sort(byDep);
    const start = toMin(startTime);

    const combos = [];
    for (const a of leg1) {
      if (toMin(a.dep) < start) continue;
      let aArr = toMin(a.arr);
      if (aArr < toMin(a.dep)) aArr += 1440; // first leg crosses midnight (rare)
      const ready = aArr + transfer;
      const nxt = leg2.find(b => toMin(b.dep) >= ready);
      if (!nxt) continue;
      combos.push({
        leg1: { system: s1, train: a.train, from: from1, to: to1, dep: a.dep, arr: a.arr },
        leg2: { system: s2, train: nxt.train, from: from2, to: to2, dep: nxt.dep, arr: nxt.arr },
        transfer_wait: toMin(nxt.dep) - aArr,
        total_min: dur(a.dep, nxt.arr),
        depart: a.dep,
        arrive: nxt.arr,
      });
    }
    combos.sort((x, y) => toMin(x.depart) - toMin(y.depart));
    return combos;
  }

  const api = { match, DIRECTIONS, STATION, TRANSFER_MIN, WEEKDAYS, toMin, dur };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Planner = api;
})(this);
