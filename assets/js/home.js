/* 홈 달력 — assets/data/schedule.json 을 읽어 그린다. 편성은 json만 고친다. */
(function () {
  var cal = document.getElementById('amfCal'), tabsEl = document.getElementById('calTabs');
  if (!cal) return;
  var DOW = ['일', '월', '화', '수', '목', '금', '토'];
  var now = new Date(Date.now() + 9 * 3600e3);              // 한국 시각
  var today = now.toISOString().slice(0, 10), thisYm = today.slice(0, 7);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  fetch('assets/data/schedule.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var P = d.programs;
      var months = AMFSchedule.months(d, thisYm, 3).map(function (ym) { var x = AMFSchedule.month(d, ym); x.ym = ym; return x; });
      if (!months.length) { cal.outerHTML = '<p class="note">일정은 전화로 안내드립니다. 064-711-9263</p>'; return; }

      function render(m) {
        var y = +m.ym.slice(0, 4), mo = +m.ym.slice(5, 7);
        var first = new Date(y, mo - 1, 1).getDay(), last = new Date(y, mo, 0).getDate();
        var h = DOW.map(function (w, i) { return '<div class="hd' + (i ? '' : ' sun') + '">' + w + '</div>'; }).join('');
        for (var b = 0; b < first; b++) h += '<div class="cell empty"></div>';
        for (var dd = 1; dd <= last; dd++) {
          var wd = (first + dd - 1) % 7, iso = m.ym + '-' + pad(dd), past = iso < today;
          var ks = m.days[dd] || [], note = (m.notes || {})[dd], body = '', href = '';
          ks.forEach(function (k) {
            var p = P[k]; if (!p) return;
            var t = AMFSchedule.timesOf(m, d, dd, k);
            body += '<span class="ev ' + k + '"><b>' + esc(p.short) + '</b>' + t.join(' · ') + '</span>';
            if (!href && p.url) href = p.url;
          });
          if (!ks.length) {
            if (wd === 1) body = '<span class="ev off">휴관</span>';
            else if (!past) { body = '<span class="ev off">대관 가능' + (note ? '<br>' + esc(note) : '') + '</span>'; href = 'booking.html'; }
          }
          if (past) href = '';
          var tag = href ? 'a' : 'div';
          h += '<' + tag + (href ? ' href="' + href + '"' : '') + ' class="cell s' + wd + (past ? ' past' : '') + '">' +
               '<span class="dn">' + dd + '</span>' + body + '</' + tag + '>';
        }
        cal.innerHTML = h;
      }

      tabsEl.innerHTML = months.map(function (m, i) {
        return '<button class="tab" type="button" role="tab" aria-selected="' + (i ? 'false' : 'true') + '" data-i="' + i + '">' + (+m.ym.slice(5, 7)) + '월</button>';
      }).join('');
      [].forEach.call(tabsEl.children, function (t) {
        t.addEventListener('click', function () {
          [].forEach.call(tabsEl.children, function (x) { x.setAttribute('aria-selected', 'false'); });
          t.setAttribute('aria-selected', 'true'); render(months[+t.dataset.i]);
        });
      });
      render(months[0]);
    })
    .catch(function () { cal.outerHTML = '<p class="note">일정을 불러오지 못했습니다. 064-711-9263으로 문의해 주십시오.</p>'; });
})();
