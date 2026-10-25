/* AMF 공연 편성 펼치기 — schedule.json 의 regular(매월 반복) + months(그 달 일정·예외)를 날짜별로 만든다.
   홈 달력(home.js)과 대관 막힘(booking.js)이 같이 쓴다. */
(function (g) {
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  /* ym 'YYYY-MM' → { days: {d: [키]}, times: {d: {키: [시각]}}, notes: {d: 글} } */
  function month(data, ym) {
    var y = +ym.slice(0, 4), m = +ym.slice(5, 7), last = new Date(y, m, 0).getDate();
    var out = { days: {}, times: {}, notes: {} }, skip = data.skip || [];
    function add(d, k, t) {
      (out.days[d] = out.days[d] || []).indexOf(k) < 0 && out.days[d].push(k);
      if (t) (out.times[d] = out.times[d] || {})[k] = t;
    }
    (data.regular || []).forEach(function (r) {
      if (r.from && ym < r.from) return;
      if (r.until && ym > r.until) return;
      var count = 0;
      for (var d = 1; d <= last; d++) {
        if (new Date(y, m - 1, d).getDay() !== r.weekday) continue;
        count++;
        if (r.nth.indexOf(count) >= 0 && skip.indexOf(ym + '-' + pad(d)) < 0) add(d, r.k, r.times);
      }
    });
    var mm = (data.months || []).filter(function (x) { return x.ym === ym; })[0];
    if (mm) {
      Object.keys(mm.days || {}).forEach(function (d) {
        mm.days[d].forEach(function (k) {
          var t = (mm.times && mm.times[d] && mm.times[d][k]) || (mm.ptimes && mm.ptimes[k]);
          add(+d, k, t);
        });
      });
      Object.keys(mm.notes || {}).forEach(function (d) { out.notes[+d] = mm.notes[d]; });
    }
    Object.keys(out.days).forEach(function (d) {          // 같은 날은 시각 순으로
      out.days[d].sort(function (a, b) { return first(out, data, d, a) < first(out, data, d, b) ? -1 : 1; });
    });
    return out;
  }
  function first(o, data, d, k) { var t = timesOf(o, data, d, k); return t[0] || '99'; }
  function timesOf(o, data, d, k) { return (o.times[d] && o.times[d][k]) || (data.programs[k] && data.programs[k].times) || []; }
  /* 보여 줄 달: 편성이 있는 달 중 지금 달부터 n개 */
  function months(data, fromYm, n) {
    var out = [], y = +fromYm.slice(0, 4), m = +fromYm.slice(5, 7);
    for (var i = 0; i < 24 && out.length < n; i++) {
      var ym = y + '-' + pad(m);
      var mm = (data.months || []).filter(function (x) { return x.ym === ym; })[0];
      var hasRule = (data.regular || []).some(function (r) { return (!r.from || ym >= r.from) && (!r.until || ym <= r.until); });
      if ((mm && mm.published !== false) || (!mm && hasRule) || (mm && hasRule)) out.push(ym);
      if (++m > 12) { m = 1; y++; }
    }
    return out;
  }
  g.AMFSchedule = { month: month, months: months, timesOf: timesOf };
})(window);
