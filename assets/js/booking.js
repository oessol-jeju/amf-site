/* AMF 대관 예약 — 화면·검증·전송. 계산은 pricing.js, 숫자는 pricing.json.
   접수: Google Apps Script(시트 'reservations' · 알림 메일 · amf 캘린더). */
(function () {
  var GAS_URL = 'https://script.google.com/macros/s/AKfycbx8dG_Th9sG_4_9G4ko7M0HMkzgHL0EExAingyVG4pchCkLK6arupzbLBWy3NuS5i8DyQ/exec';
  // 실제 접수는 정식 주소에서만. 시험 주소(github.io·로컬)에서는 보내지 않고 화면에만 보여 준다.
  var LIVE = /(^|\.)aewolmusicfactory\.com$/.test(location.hostname);
  var CONSENT_VERSION = '법무검토 v3 §1 (2026-10-18)';
  var SPACE = 'a-hall', MAX_OT = 2;

  var $ = function (id) { return document.getElementById(id); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var won = AMFPricing.won, hh = AMFPricing.hh;
  var now = new Date(Date.now() + 9 * 3600e3), today = now.toISOString().slice(0, 10);
  var S = { pr: null, sp: null, taken: {}, loaded: false, date: null, use: 'event', slots: [],
            month: { y: +today.slice(0, 4), m: +today.slice(5, 7) - 1 }, t0: Date.now() };

  /* ── 예약 현황 (읽기 전용) ── */
  function hoursOf(id) {
    var s = S.sp && S.sp.slots.filter(function (x) { return x.id === id; })[0];
    if (s) { var a = []; for (var h = s.from; h < s.to; h++) a.push(h); return a; }
    return /^h\d+$/.test(id) ? [+id.slice(1)] : [];
  }
  function loadTaken() {
    return fetch(GAS_URL).then(function (r) { return r.json(); }).then(function (d) {
      S.taken = {};
      (d.reservations || []).forEach(function (x) {
        var set = S.taken[x.date] || (S.taken[x.date] = {});
        (x.slotIds || []).forEach(function (id) { hoursOf(id).forEach(function (h) { set[h] = 1; }); });
      });
      $('calState').textContent = '';
    }).catch(function () { $('calState').textContent = '예약 현황을 불러오지 못했습니다 — 신청 후 확인해 드립니다'; })
      .then(markShows)
      .then(function () { S.loaded = true; renderCal(); renderBlocks(); update(); });
  }
  /* AMF 공연 편성(schedule.json)의 공연 시간도 막는다 — 시작 시각부터 2시간. 시각이 없는 일정(대관 등)은 하루 전체 */
  function markShows() {
    return fetch('assets/data/schedule.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
      d.months.forEach(function (m) {
        Object.keys(m.days).forEach(function (dd) {
          var iso = m.ym + '-' + pad(+dd), set = S.taken[iso] || (S.taken[iso] = {});
          m.days[dd].forEach(function (k) {
            var p = d.programs[k]; if (!p) return;
            var t = (m.times[dd] && m.times[dd][k]) || p.times;
            if (!t.length) { for (var h = S.pr.open_hour; h < S.pr.close_hour; h++) set[h] = 1; return; }
            t.forEach(function (x) { var h0 = +x.slice(0, 2); set[h0] = 1; set[h0 + 1] = 1; });
          });
        });
      });
    }).catch(function () {});
  }
  function busy(iso, h) { return !!(S.taken[iso] && S.taken[iso][h]); }
  function slotFree(iso, s) { for (var h = s.from; h < s.to; h++) if (busy(iso, h)) return false; return true; }

  /* ── 1 달력 ── */
  function renderCal() {
    var y = S.month.y, m = S.month.m;
    $('calTitle').textContent = y + '년 ' + (m + 1) + '월';
    var first = new Date(y, m, 1).getDay(), last = new Date(y, m + 1, 0).getDate();
    var h = ['일', '월', '화', '수', '목', '금', '토'].map(function (d) { return '<div class="dow">' + d + '</div>'; }).join('');
    for (var i = 0; i < first; i++) h += '<div></div>';
    for (var d = 1; d <= last; d++) {
      var iso = y + '-' + pad(m + 1) + '-' + pad(d), wd = (first + d - 1) % 7;
      var off = iso <= today || wd === 1;                     // 지난 날·당일·월요일 휴관
      var dots = '';
      if (!off && S.sp) S.sp.slots.forEach(function (s) { dots += '<i' + (slotFree(iso, s) ? '' : ' class="x"') + '></i>'; });
      var we = S.pr && AMFPricing.dayType(S.pr, iso) === 'weekend';
      h += '<button type="button" data-d="' + iso + '"' + (off ? ' disabled' : '') + ' aria-pressed="' + (iso === S.date) + '"' +
           ' aria-label="' + (m + 1) + '월 ' + d + '일' + (wd === 1 ? ' 휴관' : '') + '">' +
           '<span' + (we && !off ? ' class="we"' : '') + '>' + d + '</span><span class="dots">' + dots + '</span></button>';
    }
    $('mcal').innerHTML = h;
    var cur = new Date(+today.slice(0, 4), +today.slice(5, 7) - 1, 1);
    $('prev').disabled = new Date(y, m, 1) <= cur;
  }
  $('mcal').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-d]'); if (!b || b.disabled) return;
    S.date = b.dataset.d; S.slots = []; renderCal(); renderBlocks(); update();
  });
  $('prev').onclick = function () { var m = S.month; m.m--; if (m.m < 0) { m.m = 11; m.y--; } renderCal(); };
  $('next').onclick = function () { var m = S.month; m.m++; if (m.m > 11) { m.m = 0; m.y++; } renderCal(); };

  /* ── 2 용도 ── */
  $('use').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    S.use = b.dataset.v;
    [].forEach.call($('use').children, function (x) { x.setAttribute('aria-pressed', x === b); });
    $('kindWrap').style.display = S.use === 'event' ? '' : 'none';
    renderBlocks(); update();
  });

  /* ── 3 시간대 카드 ── */
  function renderBlocks() {
    if (!S.sp) return;
    if (!S.date) { $('blocks').innerHTML = ''; $('dateLabel').textContent = '— 날짜를 먼저 고르십시오'; return; }
    var dt = AMFPricing.dayType(S.pr, S.date), d = new Date(S.date + 'T00:00:00');
    $('dateLabel').textContent = '— ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + '일월화수목금토'[d.getDay()] + ', ' + (dt === 'weekend' ? '주말·공휴일' : '평일') + ')';
    $('blocks').innerHTML = S.sp.slots.map(function (s) {
      var free = slotFree(S.date, s), on = S.slots.indexOf(s.id) >= 0;
      var price = S.pr.confirmed ? won(s.price[dt][S.use]) : '';
      return '<button type="button" class="block" data-s="' + s.id + '" aria-pressed="' + on + '"' + (free ? '' : ' disabled') + '>' +
        '<b>' + s.name + '</b><span class="t">' + hh(s.from) + '–' + hh(s.to) + ' · ' + s.hours + '시간</span>' +
        '<span class="p">' + (free ? price : '예약됨') + '</span></button>';
    }).join('');
  }
  $('blocks').addEventListener('click', function (e) {
    var b = e.target.closest('.block'); if (!b || b.disabled) return;
    var id = b.dataset.s, i = S.slots.indexOf(id);
    if (i >= 0) S.slots.splice(i, 1); else S.slots.push(id);
    var order = S.sp.slots.map(function (s) { return s.id; });
    S.slots.sort(function (a, c) { return order.indexOf(a) - order.indexOf(c); });
    renderBlocks(); update();
  });

  /* ── 4 연장 — 비어 있는 인접 시간만 ── */
  function renderOT() {
    var keep = { before: +$('before').value, after: +$('after').value };
    var sel = S.sp.slots.filter(function (s) { return S.slots.indexOf(s.id) >= 0; });
    var maxB = 0, maxA = 0;
    if (sel.length && S.date) {
      var first = sel[0].from, last = sel[sel.length - 1].to;
      var selH = {}; sel.forEach(function (s) { for (var h = s.from; h < s.to; h++) selH[h] = 1; });
      while (maxB < MAX_OT && first - maxB - 1 >= S.pr.open_hour && !busy(S.date, first - maxB - 1) && !selH[first - maxB - 1]) maxB++;
      while (maxA < MAX_OT && last + maxA + 1 <= S.pr.close_hour && !busy(S.date, last + maxA) && !selH[last + maxA]) maxA++;
    }
    [['before', maxB], ['after', maxA]].forEach(function (x) {
      var el = $(x[0]), o = '';
      for (var n = 0; n <= x[1]; n++) o += '<option value="' + n + '">' + n + '시간</option>';
      el.innerHTML = o; el.value = Math.min(keep[x[0]], x[1]); el.disabled = x[1] === 0;
    });
  }
  ['before', 'after', 'eng', 'crew'].forEach(function (id) { $(id).addEventListener('change', update); });
  $('crewOn').addEventListener('change', function () { $('crew').disabled = !$('crewOn').checked; update(); });

  /* ── 6 예상 금액 ── */
  function query() {
    return { space: SPACE, date: S.date, use: S.use, slots: S.slots.slice(),
      before: +$('before').value || 0, after: +$('after').value || 0,
      engineer: $('eng').checked, crew: $('crewOn').checked ? +$('crew').value : 0 };
  }
  function update() {
    if (!S.pr) return;
    renderOT();
    var q = S.date && S.slots.length ? AMFPricing.calc(S.pr, query()) : null;
    var names = S.sp.slots.filter(function (s) { return S.slots.indexOf(s.id) >= 0; }).map(function (s) { return s.name; });

    $('joinmsg').textContent = !q ? '' : names.length === 1 ? names[0] + ' 1개 시간대' :
      names.join(' · ') + ' — ' + (q.joined ? '이어서 사용' : '떨어진 시간대 (사이 시간은 다른 일정이 들어갈 수 있습니다)');

    var box = $('quote');
    if (!q) box.innerHTML = '<p class="muted" style="margin:0">날짜와 시간대를 고르면 표시됩니다.</p>';
    else if (!S.pr.confirmed) box.innerHTML = '<p style="margin:0">요금 안내 준비 중 — 견적은 회신으로 드립니다.</p>';
    else {
      var h = q.lines.map(function (l) { return '<div class="q"><span>' + l.label + '</span><span>' + (l.amt < 0 ? '−' + won(-l.amt) : won(l.amt)) + '</span></div>'; }).join('');
      if (S.slots.length > 1 && !q.discount) h += '<div class="q"><span>묶음 할인</span><span>해당 없음 (떨어진 시간대)</span></div>';
      h += '<div class="q"><span>공급가액</span><span>' + won(q.supply) + '</span></div>' +
           '<div class="q"><span>부가세 10%</span><span>' + won(q.vat) + '</span></div>' +
           '<div class="q tot"><span>예상 합계</span><span>' + won(q.total) + '</span></div>' +
           '<div class="q"><span>예약금 (합계의 ' + Math.round(S.pr.deposit_rate * 100) + '%) — 입금 시 확정</span><b>' + won(q.deposit) + '</b></div>' +
           '<div class="q"><span>잔금 — 사용일 전까지</span><span>' + won(q.balance) + '</span></div>' +
           '<p class="fix">' + S.pr.estimate_notice + '</p>';
      box.innerHTML = h;
    }
    var bar = !S.date ? '날짜와 시간대를 고르십시오' :
      (+S.date.slice(5, 7)) + '월 ' + (+S.date.slice(8, 10)) + '일 · ' + (names.length ? names.join('·') : '시간대 선택') +
      (q && S.pr.confirmed ? ' · 예상 <b>' + won(q.total) + '</b>' : '');
    $('barText').innerHTML = bar;
    return q;
  }

  /* ── 전송 ── */
  function say(t, err) { var m = $('msg'); m.innerHTML = t; m.className = 'msg show' + (err ? ' err' : ''); m.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  function stamp() { var d = new Date(Date.now() + 9 * 3600e3).toISOString(); return d.slice(0, 10) + ' ' + d.slice(11, 19); }

  $('f').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var v = function (id) { return $(id).value.trim(); };
    if ($('website').value) return;                                   // 자동 입력 차단
    if (Date.now() - S.t0 < 5000) return say('잠시 후 다시 눌러 주십시오.', 1);
    if (!S.date) return say('날짜를 골라 주십시오.', 1);
    if (!S.slots.length) return say('시간대를 하나 이상 골라 주십시오.', 1);
    if (!v('org') || !v('name')) return say('단체명·공연명과 담당자를 적어 주십시오.', 1);
    if (!/^[\d\-+\s()]{9,}$/.test(v('phone'))) return say('휴대전화 번호를 확인해 주십시오.', 1);
    if (v('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) return say('이메일 형식을 확인해 주십시오.', 1);
    var att = +v('att'), max = S.sp.max_capacity;
    if (!att || att < 1) return say('예상 인원을 적어 주십시오.', 1);
    if (att > max) return say('A홀 최대 인원은 ' + max + '명입니다.', 1);
    if (!$('agree').checked) return say('개인정보 안내 확인에 체크해 주십시오.', 1);

    var q = AMFPricing.calc(S.pr, query()), qq = query(), at = stamp();
    var sel = S.sp.slots.filter(function (s) { return S.slots.indexOf(s.id) >= 0; });
    var first = sel[0].from, last = sel[sel.length - 1].to, ids = S.slots.slice();
    for (var h = first - qq.before; h < first; h++) ids.push('h' + h);
    for (h = last; h < last + qq.after; h++) ids.push('h' + h);
    var useK = S.use === 'event' ? '행사(' + v('kind') + ')' : '리허설·연습';
    var summary = '[' + useK + ' · ' + sel.map(function (s) { return s.name; }).join('+') + (q.joined || sel.length === 1 ? '' : ' 떨어진 시간대') +
      (qq.before ? ' · 앞당김 ' + qq.before + 'h' : '') + (qq.after ? ' · 연장 ' + qq.after + 'h' : '') +
      (qq.crew ? ' · 스태프 ' + qq.crew + '명' : '') + ' · 요금표 ' + S.pr.version + (S.pr.confirmed ? '' : '(비공개)') +
      ' · 고지확인 ' + at + ' · 소식수신 ' + ($('news').checked ? 'Y' : 'N') + ']';

    var payload = {
      date: S.date, purpose: S.use === 'event' ? 'performance' : 'rehearsal', slotIds: ids,
      eventName: v('org'), name: v('name'), phone: v('phone'), email: v('email'), attendees: att,
      note: (summary + ' ' + v('note')).trim(),
      options: { engineer: qq.engineer, crew: qq.crew },
      quote: { dayType: q.dayType, baseTotal: q.blockSum,
        appliedDiscount: q.discount ? { label: '이어진 시간대 묶음', rate: 0, amount: q.discount } : null,
        optionLines: q.lines.filter(function (l) { return l.k === 'over' || l.k === 'opt'; }).map(function (l) { return { label: l.label }; }),
        optionTotal: q.overtime + q.options, total: q.total, deposit: q.deposit, balance: q.balance },
      // v3 백엔드 칸 (v2 백엔드는 무시하고 note에 요약이 남는다)
      v3: { space: SPACE, use: useK, slots: S.slots, joined: q.joined, overBefore: qq.before, overAfter: qq.after,
        blockSum: q.blockSum, discount: q.discount, overtime: q.overtime, optionAmt: q.options, total: q.total, deposit: q.deposit,
        pricingVersion: S.pr.version, pricingPublic: !!S.pr.confirmed, consentAt: at, consentVersion: CONSENT_VERSION,
        newsletter: $('news').checked, newsletterAt: $('news').checked ? at : '' }
    };

    if (!LIVE) {
      console.log('[시험 주소 — 접수 안 함]', payload);
      return say('<b>시험 주소입니다 — 실제로 접수되지 않았습니다.</b><br>' + summary + '<br>예상 합계 ' + won(q.total) + ' · 예약금 ' + won(q.deposit));
    }
    var btn = $('submit'); btn.disabled = true; btn.textContent = '보내는 중';
    fetch(GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'create', payload: payload }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.ok) return say(d.error || '접수하지 못했습니다. 064-711-9263으로 연락 주십시오.', 1);
        say('<b>신청이 접수되었습니다. 접수번호 ' + d.id + '</b><br>일정 확인 후 연락드립니다. 확정이 아니며, 예약금 입금 시 확정됩니다.' +
            (S.pr.confirmed ? '<br>' + S.pr.estimate_notice : ''));
        $('f').reset(); S.slots = []; S.date = null; S.t0 = Date.now();
        loadTaken(); update();
      })
      .catch(function () { say('네트워크 오류입니다. 잠시 후 다시 시도하시거나 064-711-9263으로 연락 주십시오.', 1); })
      .then(function () { btn.disabled = false; btn.textContent = '예약 신청하기'; });
  });

  /* ── 시작 ── */
  AMFPricing.load().then(function (pr) {
    if (!pr) { say('요금표를 불러오지 못했습니다. 064-711-9263으로 문의해 주십시오.', 1); return; }
    S.pr = pr; S.sp = AMFPricing.space(pr, SPACE);
    renderCal(); renderBlocks(); update(); loadTaken();
  });
})();
