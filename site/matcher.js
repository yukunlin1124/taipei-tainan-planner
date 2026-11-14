// Combined TR + HSR trip matcher: the one home of the trip-matching rules.
//
// Tainan -> Taipei : TR Tainan->Shalun, then HSR Tainan->Taipei.
// Taipei -> Tainan : HSR Taipei->Tainan, then TR Shalun->Tainan.
// Each first-leg train is paired with the earliest second-leg train that
// departs at/after it arrives (plus TRANSFER_MIN).
(function (root) {
  const TRANSFER_MIN = 0; // minimum change time at Shalun <-> HSR Tainan

  const DIRECTIONS = {
    south_to_north: {
      label: 'Tainan → Taipei',
      leg1: ['tr_tainan_shalun', 'TR', 'Tainan', 'Shalun'],
      leg2: ['hsr_tainan_taipei', 'HSR', 'Tainan (HSR)', 'Taipei'],
    },
    north_to_south: {
      label: 'Taipei → Tainan',
      leg1: ['hsr_taipei_tainan', 'HSR', 'Taipei', 'Tainan (HSR)'],
      leg2: ['tr_shalun_tainan', 'TR', 'Shalun', 'Tainan'],
    },
  };

  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const dur = (dep, arr) => { const d = toMin(arr) - toMin(dep); return d < 0 ? d + 1440 : d; };

  function match(tables, direction, startTime, transfer = TRANSFER_MIN) {
    const cfg = DIRECTIONS[direction];
    const [f1, s1, from1, to1] = cfg.leg1;
    const [f2, s2, from2, to2] = cfg.leg2;
    const byDep = (a, b) => toMin(a.dep) - toMin(b.dep);
    const leg1 = [...tables[f1]].sort(byDep);
    const leg2 = [...tables[f2]].sort(byDep);
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

  const api = { match, DIRECTIONS, TRANSFER_MIN, toMin, dur };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Planner = api;
})(this);
