/* AMF 대관 요금 계산 — 숫자는 assets/data/pricing.json 에만 있다. 여기는 계산식만.
   규칙 출처: 기획_AMF홈페이지_HTML이전_설계_v5.md d-5-2 */
(function (g) {
  var cache = null;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var A = {
    hh: function (h) { return pad(h) + ':00'; },
    won: function (n) { return Math.round(n).toLocaleString('ko-KR') + '원'; },
    load: function () {
      if (cache) return cache;
      cache = Promise.all([
        fetch('assets/data/pricing.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }),
        fetch('assets/data/holidays.json', { cache: 'no-cache' }).then(function (r) { return r.json(); })
      ]).then(function (x) { x[0]._holidays = x[1].dates || []; return x[0]; })
        .catch(function () { return null; });
      return cache;
    },
    dayType: function (pr, iso) {
      var d = new Date(iso + 'T00:00:00').getDay();
      return (d === 0 || d === 6 || pr._holidays.indexOf(iso) >= 0) ? 'weekend' : 'weekday';
    },
    space: function (pr, id) { return pr.spaces.filter(function (s) { return s.id === id; })[0]; },
    slotAt: function (sp, hour) { return sp.slots.filter(function (s) { return hour >= s.from && hour < s.to; })[0]; },

    /* q = { space, date, use:'event'|'rehearsal', slots:[id], before:n, after:n, engineer:bool, crew:n } */
    calc: function (pr, q) {
      var sp = A.space(pr, q.space), dt = A.dayType(pr, q.date), lines = [];
      var sel = sp.slots.filter(function (s) { return q.slots.indexOf(s.id) >= 0; });
      if (!sel.length) return null;
      var unit = function (s) { return s.price[dt][q.use]; };

      // 1) 시간대 요금
      var blockSum = 0;
      sel.forEach(function (s) { blockSum += unit(s); lines.push({ k: 'slot', label: s.name + ' (' + A.hh(s.from) + '–' + A.hh(s.to) + ')', amt: unit(s), unit: A.won(unit(s)), qty: '1' }); });

      // 2) 이어진 시간대 묶음 할인 — 떨어진 시간대는 할인 없음
      var bd = sp.combine.bundle_discount, groups = [], cur = [sel[0]];
      for (var i = 1; i < sel.length; i++) {
        if (sel[i].from === sel[i - 1].to) cur.push(sel[i]); else { groups.push(cur); cur = [sel[i]]; }
      }
      groups.push(cur);
      var disc = 0, joined = groups.length === 1 && sel.length > 1;
      groups.forEach(function (gr) {
        var r = bd.rates[String(gr.length)];
        if (gr.length > 1 && r) {
          var sum = 0; gr.forEach(function (s) { sum += unit(s); });
          disc += Math.round(sum * r);
          lines.push({ k: 'disc', label: '이어진 ' + gr.length + '개 시간대 할인 ' + Math.round(r * 100) + '%', amt: -Math.round(sum * r), unit: A.won(sum) + ' × ' + Math.round(r * 100) + '%', qty: '' });
        }
      });

      // 3) 시간대 밖 연장 — 들어가는 시간대 요금 ÷ 그 시간대 시간, 시간대별 상한
      var ot = sp.overtime, over = 0;
      function overtime(from, to, label) {
        var bySlot = {};
        for (var h = from; h < to; h++) {
          var s = A.slotAt(sp, h); if (!s) continue;
          (bySlot[s.id] = bySlot[s.id] || { s: s, n: 0 }).n++;
        }
        Object.keys(bySlot).forEach(function (id) {
          var b = bySlot[id], per = unit(b.s) / b.s.hours, amt = per * b.n;
          if (ot.cap_at_slot_price) amt = Math.min(amt, unit(b.s));
          amt = Math.round(amt); over += amt;
          lines.push({ k: 'over', label: label + ' ' + b.n + '시간 (' + b.s.name + ' 시간대 · 시간당 ' + A.won(per) + ')', short: label + ' (' + b.s.name + ' 시간대)', amt: amt, unit: A.won(per) + ' / 시간', qty: b.n + '시간' });
        });
      }
      var first = sel[0].from, last = sel[sel.length - 1].to;
      if (q.before) overtime(first - q.before, first, '입장 앞당김');
      if (q.after) overtime(last, last + q.after, '퇴실 연장');

      // 4) 옵션
      var hours = 0; sel.forEach(function (s) { hours += s.hours; }); hours += (q.before || 0) + (q.after || 0);
      var opt = 0;
      if (q.engineer) {
        var e = pr.options.filter(function (o) { return o.id === 'engineer'; })[0];
        var ea = e.base_price + Math.max(0, hours - e.base_hours) * e.extra_per_hour;
        opt += ea; lines.push({ k: 'opt', label: '음향·조명 엔지니어 ' + hours + '시간', short: '음향·조명 엔지니어', amt: ea, unit: e.base_hours + '시간 ' + A.won(e.base_price) + ' + ' + A.won(e.extra_per_hour) + '/시간', qty: hours + '시간' });
      }
      if (q.crew > 0) {
        var c = pr.options.filter(function (o) { return o.id === 'crew'; })[0];
        var ca = c.price * q.crew * hours;
        opt += ca; lines.push({ k: 'opt', label: '행사 스태프 ' + q.crew + '명 × ' + hours + '시간', amt: ca, unit: A.won(c.price) + '/인·시간', qty: q.crew + '명×' + hours + '시간', short: '행사 스태프' });
      }

      var supply = blockSum - disc + over + opt, vat = Math.round(supply * pr.vat_rate), total = supply + vat;
      var deposit = Math.round(total * pr.deposit_rate);
      return { dayType: dt, lines: lines, hours: hours, joined: joined, groups: groups.length,
        blockSum: blockSum, discount: disc, overtime: over, options: opt,
        supply: supply, vat: vat, total: total, deposit: deposit, balance: total - deposit, version: pr.version };
    }
  };
  g.AMFPricing = A;
})(window);
