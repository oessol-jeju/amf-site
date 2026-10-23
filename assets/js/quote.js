/* AMF A홀 대관 견적서 — 대관 예약 화면에서 고른 내용으로 A4 1장을 만든다.
   양식: 07_대관서무/견적_AMF_A홀대관_가양금병창단또바기_261219.html (2026-10-15 발행본) 디자인.
   PDF 내려받기는 html2pdf(cdnjs)를 그때 불러온다. 인쇄는 새 창에서 브라우저 인쇄. */
(function (g) {
  var SUPPLIER = {
    name: '지티글로벌(주)', venue: '애월뮤직팩토리', no: '616-81-51642', rep: '최명성',
    addr: '제주특별자치도 제주시 애월읍 엄수로 63', biz: '서비스업 / 공연 및 제작관련 서비스업',
    tel: '064-711-9263', mail: 'ceo@aewolmusicfactory.com',
    signer: '김외솔'   // 서명란 — 2026-10-23 본인 지시 '대표 김외솔(인), 직인생략'. 위 rep(최명성)는 사업자등록증 대표자
  };  // 사업자등록증(2025-10-17 정정 발급) 대조 2026-10-22
  var USE_NOTES = [
    '대관 시간은 입장부터 퇴실까지이며, 준비·리허설·정리 시간을 포함합니다.',
    '사용 시간을 넘기면 1시간 단위로 추가 요금이 부과됩니다.',
    '세부 진행 순서와 장비 요청은 사용일 7일 전까지 알려 주십시오.',
    '시설·장비 파손 시 원상복구 비용은 사용 단체가 부담합니다.',
    '사용 후 객석과 무대를 원래 상태로 정리해 주십시오.',
    '공연장 내 음식물 반입과 흡연은 금지됩니다.',
    '세금계산서 발행이 필요하시면 사업자등록증을 보내 주십시오.'
  ];
  var CSS = "@page{size:A4;margin:0}*{box-sizing:border-box;margin:0;padding:0}" +
    "body{font-family:'Noto Sans KR',sans-serif;color:#1f2a2e;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
    ".qpage{width:210mm;height:296mm;overflow:hidden;padding:11mm 15mm 9mm;display:flex;flex-direction:column;background:#fff;font-family:'Noto Sans KR',sans-serif;color:#1f2a2e}" +
    ".qpage .q-top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #1A1A1A;padding-bottom:4mm}" +
    ".qpage .q-brand{font-size:9pt;letter-spacing:.3em;color:#666158}" +
    ".qpage,.qpage *{letter-spacing:normal;text-transform:none}.qpage p,.qpage ul,.qpage li,.qpage table,.qpage h1,.qpage h2,.qpage div{margin-top:0;margin-bottom:0}.qpage ul{padding:0}.qpage h1,.qpage h2{font-family:'Noto Sans KR',sans-serif;text-wrap:wrap}.qpage th,.qpage td{white-space:normal;vertical-align:middle;font-size:inherit;letter-spacing:normal;text-transform:none;color:inherit}.qpage th{color:#fff}" +
    ".qpage h1{font-size:21pt;font-weight:700;color:#1A1A1A;margin-top:1.5mm!important}.qpage h1 span{color:#9A7A2E}" +
    ".qpage .q-doc{text-align:right;font-size:8.6pt;color:#666158;line-height:1.7}" +
    ".qpage .q-to{margin:3.5mm 0 2.6mm!important;font-size:10pt;line-height:1.6}.qpage .q-to b{font-size:14pt;color:#1A1A1A}" +
    ".qpage .q-blank{display:inline-block;min-width:60mm;border-bottom:1px solid #1A1A1A;height:7mm;vertical-align:bottom}" +
    ".qpage .q-grid{display:grid;grid-template-columns:1.5fr 1.2fr 1fr .7fr;gap:2mm}" +
    ".qpage .q-card{background:#F5F3EF;border-radius:2mm;padding:2.4mm 3.2mm}" +
    ".qpage .q-lbl{font-size:8pt;letter-spacing:.15em;color:#9A7A2E;font-weight:700;margin-bottom:1mm}" +
    ".qpage .q-val{font-size:10pt;font-weight:500;line-height:1.5}.qpage .q-val small{display:block;font-size:8.2pt;color:#666158;font-weight:400}" +
    ".qpage h2{font-size:10pt;color:#1A1A1A;margin:3.6mm 0 1.6mm!important;padding-left:3mm;border-left:3px solid #9A7A2E}" +
    ".qpage table{width:100%;border-collapse:collapse;font-size:9.2pt}" +
    ".qpage th{background:#1A1A1A;color:#fff;font-weight:500;padding:1.5mm 2.5mm;text-align:center}" +
    ".qpage td{padding:1.5mm 2.5mm;border-bottom:1px solid #D9D6CF;text-align:center}" +
    ".qpage td.q-l{text-align:left}.qpage td.q-r{text-align:right;white-space:nowrap}.qpage td.q-m{color:#9A7A2E}" +
    ".qpage tr.q-sum td{border-bottom:none;font-size:9.2pt;color:#666158;padding:1.2mm 2.5mm}" +
    ".qpage .q-total{margin-top:1.5mm!important;border-top:1.5px solid #9A7A2E;border-bottom:1.5px solid #9A7A2E;padding:2.2mm 6mm;display:flex;justify-content:space-between;align-items:center}" +
    ".qpage .q-total .q-k{font-size:10.5pt;letter-spacing:.1em}.qpage .q-total .q-v{font-size:18pt;font-weight:700;color:#9A7A2E}.qpage .q-total .q-v small{font-size:9.5pt;color:#1A1A1A;font-weight:400;margin-left:1.5mm}" +
    ".qpage .q-dep{margin-top:1.8mm!important;border:1.5px solid #9A7A2E;border-radius:2mm;padding:2mm 5mm;display:flex;justify-content:space-between;align-items:center;font-size:9.8pt;line-height:1.55;font-weight:500}" +
    ".qpage .q-dep small{font-size:8.4pt;color:#666158;font-weight:400}.qpage .q-dv{font-size:16pt;font-weight:700;color:#9A7A2E;white-space:nowrap}.qpage .q-dv small{font-size:9.5pt;color:#1f2a2e}" +
    ".qpage ul{list-style:none;font-size:8.3pt;line-height:1.45;columns:2;column-gap:7mm}" +
    ".qpage li{padding-left:3.5mm;position:relative;break-inside:avoid;margin-bottom:.5mm!important}" +
    ".qpage li:before{content:'';position:absolute;left:0;top:2.1mm;width:1.5mm;height:1.5mm;background:#9A7A2E;border-radius:50%}" +
    ".qpage .q-refund{font-size:8.6pt;line-height:1.5;color:#1f2a2e}" +
    ".qpage .q-sup{margin-top:auto!important;padding-top:3mm;display:grid;grid-template-columns:1fr auto;gap:6mm;align-items:end;border-top:1px solid #D9D6CF}" +
    ".qpage .q-sup table{font-size:8.2pt}.qpage .q-sup td{padding:.7mm 2mm;border-bottom:1px solid #ECE9E2;text-align:left}.qpage .q-sup td.q-k{color:#666158;white-space:nowrap;width:18mm}" +
    ".qpage .q-sign{text-align:right;font-size:12.5pt;color:#1A1A1A;line-height:1.6}.qpage .q-sign small{display:block;font-size:8.6pt;color:#666158}" +
    ".qpage .q-seal{display:inline-block;margin-left:3mm;color:#666158;font-size:10pt}" +
    ".qpage table.q-items{table-layout:fixed}.qpage table.q-items td:nth-child(2),.qpage table.q-items td:nth-child(3){white-space:nowrap;font-size:8.6pt}" +
    ".qpage.q-tight{padding-top:8mm;padding-bottom:7mm}.qpage.q-tight td{padding-top:1mm;padding-bottom:1mm}.qpage.q-tight ul{font-size:7.8pt;line-height:1.35}.qpage.q-tight h2{margin:2.6mm 0 1.2mm!important}.qpage.q-tight .q-card{padding:1.8mm 3mm}" +
    ".qpage .q-fix{margin-top:2.5mm!important;font-size:8.6pt;color:#666158}";

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function num(n) { return Math.round(n).toLocaleString('ko-KR'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function kst() { return new Date(Date.now() + 9 * 3600e3); }

  /* d = { pr, q(calc 결과), sel(선택 시간대), date, use, kind, before, after, org, name, phone, email, att } */
  function build(d) {
    var won = AMFPricing.won, hh = AMFPricing.hh, t = kst();
    var no = 'AMF-Q' + String(t.getUTCFullYear()).slice(2) + pad(t.getUTCMonth() + 1) + pad(t.getUTCDate()) + '-' + pad(t.getUTCHours()) + pad(t.getUTCMinutes()) + pad(t.getUTCSeconds());
    var issued = t.getUTCFullYear() + '. ' + (t.getUTCMonth() + 1) + '. ' + t.getUTCDate() + '.';
    var dd = new Date(d.date + 'T00:00:00'), dayK = '일월화수목금토'[dd.getDay()];
    var dateK = dd.getFullYear() + '년 ' + (dd.getMonth() + 1) + '월 ' + dd.getDate() + '일 (' + dayK + ')';
    var first = d.sel[0].from - d.before, last = d.sel[d.sel.length - 1].to + d.after;
    var times = d.sel.map(function (s) { return s.name + ' ' + hh(s.from) + '–' + hh(s.to); }).join(' · ');
    var ot = [d.before ? '입장 ' + hh(first) + '부터' : '', d.after ? '퇴실 ' + hh(last) + '까지' : ''].filter(Boolean).join(' · ');
    var dayType = d.q.dayType === 'weekend' ? '주말·공휴일' : '평일';
    var useK = d.use === 'event' ? '행사 · ' + d.kind : '리허설 · 연습';

    var rows = d.q.lines.map(function (l) {
      var label = l.k === 'slot' ? 'A홀 ' + l.label + ' — ' + dayType + ' ' + (d.use === 'event' ? '행사' : '리허설') : (l.short || l.label);
      return '<tr><td class="q-l">' + esc(label) + '</td><td>' + esc(l.unit || '') + '</td><td>' + esc(l.qty || '') + '</td><td class="q-r' + (l.amt < 0 ? ' q-m' : '') + '">' +
        (l.amt < 0 ? '-' + num(-l.amt) : num(l.amt)) + '원</td></tr>';
    }).join('');

    var pa = d.pr.payment_account || {};
    var acct = (pa.public && pa.bank && pa.number)
      ? '입금 계좌 <b style="color:#1A1A1A">' + esc(pa.bank) + ' ' + esc(pa.number) + '</b> (예금주 ' + esc(pa.holder) + ')'
      : '입금 계좌는 예약 확인 연락 때 안내드립니다.';
    var refund = d.pr.cancellation.tiers.map(function (x) { return x.label + ' ' + Math.round(x.refund_rate * 100) + '%'; }).join(' · ');
    var to = d.org ? '<b>' + esc(d.org) + '</b> 귀하' : '<span class="q-blank"></span> 귀하';
    var contact = [d.name ? '담당 ' + esc(d.name) : '', esc(d.phone || ''), esc(d.email || '')].filter(Boolean).join(' · ');

    var body =
      '<div class="qpage">' +
      '<div class="q-top"><div><div class="q-brand">AEWOL MUSIC FACTORY</div><h1>A홀 대관 <span>견적서</span></h1></div>' +
      '<div class="q-doc">견적번호 ' + no + '<br>발행일 ' + issued + '<br>견적 유효기간 발행일로부터 30일</div></div>' +
      '<div class="q-to">' + to + (contact ? '<br><span style="font-size:9.5pt;color:#666158">' + contact + '</span>' : '') +
      '<br>애월뮤직팩토리 A홀 대관 견적을 아래와 같이 드립니다.</div>' +
      '<div class="q-grid">' +
      '<div class="q-card"><div class="q-lbl">사용 일시</div><div class="q-val">' + dateK + '<small>' + times + (ot ? ' · ' + ot : '') + ' · 총 ' + d.q.hours + '시간</small></div></div>' +
      '<div class="q-card"><div class="q-lbl">사용 공간</div><div class="q-val">애월뮤직팩토리 A홀<small>최대 100명 · 음향·조명 장비·냉난방 포함</small></div></div>' +
      '<div class="q-card"><div class="q-lbl">용도</div><div class="q-val">' + esc(useK) + '<small>' + dayType + ' 요금' + (d.sel.length > 1 ? ' · ' + (d.q.joined ? '이어진 시간대' : '떨어진 시간대') : '') + '</small></div></div>' +
      '<div class="q-card"><div class="q-lbl">예상 인원</div><div class="q-val">' + (d.att ? esc(d.att) + '명' : '—') + '</div></div>' +
      '</div>' +
      '<h2>견적 내역</h2>' +
      '<table class="q-items"><colgroup><col style="width:44%"><col style="width:28%"><col style="width:12%"><col style="width:16%"></colgroup><tr><th>항목</th><th>단가</th><th>수량</th><th>금액</th></tr>' + rows +
      '<tr class="q-sum"><td class="q-l" colspan="3">공급가액</td><td class="q-r">' + num(d.q.supply) + '원</td></tr>' +
      '<tr class="q-sum"><td class="q-l" colspan="3">부가가치세 (10%)</td><td class="q-r">' + num(d.q.vat) + '원</td></tr></table>' +
      '<div class="q-total"><div class="q-k">합계 금액 (부가세 포함)</div><div class="q-v">' + num(d.q.total) + '<small>원</small></div></div>' +
      '<div class="q-dep"><div><div class="q-lbl">예약 확정 안내</div>예약금(합계의 ' + Math.round(d.pr.deposit_rate * 100) + '%)을 입금하시면 예약이 확정됩니다.<br>' +
      '<small>잔금 ' + won(d.q.balance) + '은 사용일 전까지 입금해 주십시오. ' + acct + '</small></div>' +
      '<div class="q-dv">' + num(d.q.deposit) + '<small>원</small></div></div>' +
      '<h2>취소 환불 (낸 금액 기준)</h2><p class="q-refund">' + esc(refund) + ' · AMF 사정으로 취소하면 낸 금액 전액을 돌려드립니다.</p>' +
      '<h2>사용 안내</h2><ul>' + USE_NOTES.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
      '<p class="q-fix">' + esc(d.pr.estimate_notice) + ' (요금표 ' + esc(d.pr.version) + ')</p>' +
      '<div class="q-sup"><table>' +
      '<tr><td class="q-k">상호</td><td>' + SUPPLIER.name + ' (' + SUPPLIER.venue + ')</td><td class="q-k">등록번호</td><td>' + SUPPLIER.no + '</td></tr>' +
      '<tr><td class="q-k">대표자</td><td>' + SUPPLIER.rep + '</td><td class="q-k">업태 / 종목</td><td>' + SUPPLIER.biz + '</td></tr>' +
      '<tr><td class="q-k">사업장</td><td colspan="3">' + SUPPLIER.addr + ' · ' + SUPPLIER.tel + ' · ' + SUPPLIER.mail + '</td></tr>' +
      '</table><div class="q-sign"><small>공급자</small>' + SUPPLIER.venue + '<br>대표 ' + SUPPLIER.signer + '<span class="q-seal">(인)</span><small>직인생략</small></div></div>' +
      '</div>';
    return { no: no, body: body, html: '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>AMF A홀 대관 견적서 ' + no + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet"><style>' + CSS + '</style></head><body>' + body + '</body></html>' };
  }

  /* A4 한 장(296mm)에 안 들어가면 촘촘하게 */
  function fit(pg) {
    pg.style.height = 'auto';
    var limit = pg.ownerDocument.defaultView.getComputedStyle(pg).width.replace('px', '') * 296 / 210;
    if (pg.scrollHeight > limit) pg.classList.add('q-tight');
    pg.style.height = '';
  }

  function loadLib() {
    if (g.html2pdf) return Promise.resolve();
    return new Promise(function (ok, no) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      s.onload = ok; s.onerror = no; document.head.appendChild(s);
    });
  }

  g.AMFQuoteDoc = {
    build: build, fit: fit,
    pdf: function (d) {
      var doc = build(d);
      return loadLib().then(function () {
        var holder = document.createElement('div');
        holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:210mm;background:#fff';
        holder.innerHTML = '<style>' + CSS.replace('@page{size:A4;margin:0}', '').replace(/(^|\})\*\{[^}]*\}/, '$1').replace(/body\{[^}]*\}/, '') + '</style>' + doc.body;
        document.body.appendChild(holder);
        return (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
          fit(holder.querySelector('.qpage'));
          return g.html2pdf().set({ margin: 0, filename: 'AMF_A홀대관_견적서_' + d.date + '_' + doc.no + '.pdf',
            image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 2, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(holder.querySelector('.qpage')).save();
        }).then(function () { holder.remove(); }, function (e) { holder.remove(); throw e; });
      });
    },
    print: function (d) {
      var doc = build(d), w = g.open('', '_blank');
      if (!w) return false;
      w.document.open(); w.document.write(doc.html); w.document.close();
      var go = function () { fit(w.document.querySelector('.qpage')); w.focus(); w.print(); };
      if (w.document.fonts) w.document.fonts.ready.then(function () { setTimeout(go, 300); }); else setTimeout(go, 800);
      return true;
    }
  };
})(window);
