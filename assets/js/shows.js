/* 공연 예약 쪽 — schedule.json 에서 공연별 다가오는 날짜(석 달 치)를 뽑아 적는다. 편성은 json만 고친다. */
(function () {
  var lists = document.querySelectorAll('ul.dates[data-k]');
  if (!lists.length) return;
  var DOW = ['일', '월', '화', '수', '목', '금', '토'];
  var now = new Date(Date.now() + 9 * 3600e3);              // 한국 시각
  var today = now.toISOString().slice(0, 10), thisYm = today.slice(0, 7);
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fail() { [].forEach.call(lists, function (ul) { ul.innerHTML = '<li class="muted">날짜는 전화로 안내드립니다 · 064-711-9263</li>'; }); }

  fetch('assets/data/schedule.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var found = {};
      AMFSchedule.months(d, thisYm, 3).forEach(function (ym) {
        var m = AMFSchedule.month(d, ym), y = +ym.slice(0, 4), mo = +ym.slice(5, 7);
        Object.keys(m.days).map(Number).sort(function (a, b) { return a - b; }).forEach(function (dd) {
          var iso = ym + '-' + pad(dd);
          if (iso < today) return;
          m.days[dd].forEach(function (k) {
            (found[k] = found[k] || []).push({
              label: mo + '월 ' + dd + '일 (' + DOW[new Date(y, mo - 1, dd).getDay()] + ')',
              times: AMFSchedule.timesOf(m, d, dd, k).join(' · ')
            });
          });
        });
      });
      [].forEach.call(lists, function (ul) {
        var k = ul.dataset.k, p = d.programs[k], rows = found[k] || [];
        if (!rows.length) { ul.innerHTML = '<li class="muted">다가오는 날짜는 전화로 안내드립니다 · 064-711-9263</li>'; return; }
        ul.innerHTML = rows.map(function (r) {
          var inner = '<b>' + r.label + '</b><span>' + r.times + '</span>';
          return '<li>' + (p && p.url ? '<a href="' + p.url + '">' + inner + '</a>' : inner) + '</li>';
        }).join('');
      });
    })
    .catch(fail);
})();
