#!/usr/bin/env python3
"""AMF 사이트 생성기 — _src/pages/*.html 본문에 공통 머리·메뉴·푸터를 씌워 루트에 내놓는다.

    python3 build.py          # 페이지 생성 + 확인 필요 항목(.todo) 개수 출력
    python3 build.py --check  # 공개 전 점검: .todo 가 하나라도 있으면 실패(종료코드 1)

메뉴·푸터를 고칠 때는 아래 NAV / FOOT 만 고친다.
"""
import re, sys, pathlib, datetime

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / '_src' / 'pages'
SITE = 'https://www.aewolmusicfactory.com'
NAVER = 'https://booking.naver.com/booking/12/bizes/1553958'
ASSET_V = datetime.datetime.now().strftime('%Y%m%d%H%M')  # css·js 캐시 무효화

NAV = [
    ('index',    './',                                '공연 안내'),
    ('booking',  'booking.html',                    '대관 예약'),
    ('jeju',     'https://oessol.kr/jeju-events/',   '문화예술정보'),
    ('venue',    'venue.html',                      '공연장 이용안내'),
    ('essencia', 'essencia.html',                   '에센시아 합창단', [   # 하위 메뉴
        ('kids',    'essencia.html#kids', '어린이합창단'),
        ('recruit', 'recruit.html',       '중창단'),
    ]),
]

FOOT = '''<footer class="foot">
  <div class="wrap">
    <div class="cols">
      <div><b>애월뮤직팩토리</b>제주특별자치도 제주시 애월읍 엄수로 63<br>63 Eomsu-ro, Aewol-eup, Jeju</div>
      <div><b>연락처</b><a href="tel:0647119263">064-711-9263</a><br><a href="https://wa.me/821074142619">WhatsApp +82 10-7414-2619</a><br><a href="mailto:ceo@aewolmusicfactory.com">ceo@aewolmusicfactory.com</a></div>
      <div><b>운영 시간</b>평일 10:00~18:00<br>월요일 휴관</div>
      <div><b>바로가기</b><a href="{naver}">네이버 예약</a><br><a href="https://www.instagram.com/aewolmusicfactory/">Instagram</a><br><a href="privacy.html">개인정보 처리방침</a></div>
    </div>
    <p class="biz">지티글로벌(주) · 대표 최명성 · 사업자등록번호 616-81-51642 · 제주특별자치도 제주시 애월읍 엄수로 63<br>위탁 운영 김외솔</p>
  </div>
</footer>'''.replace('{naver}', NAVER)

LAYOUT = '''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
{robots}<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="애월뮤직팩토리">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{site}/img/{og}">
<meta property="og:url" content="{url}">
{base}<link rel="icon" href="favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@400;500;700&display=swap">
<link rel="stylesheet" href="assets/css/site.css?v={v}">
</head>
<body{bodycls}>
<a class="skip" href="#main">본문 바로가기</a>
<header class="top">
  <div class="in">
    <a class="logo" href="./"><b>애월뮤직팩토리</b><small>Aewol Music Factory</small></a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="nav">메뉴</button>
    <nav class="nav" id="nav" aria-label="주 메뉴">
{nav}
      <a class="buy" href="{naver}">예매</a>
    </nav>
  </div>
</header>
<main id="main">
{body}
</main>
{foot}
<script>
(function(){{var b=document.querySelector('.burger'),n=document.getElementById('nav');
b.addEventListener('click',function(){{var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)}});}})();
</script>
{scripts}
</body>
</html>
'''


def nav_html(cur):
    out = []
    for key, href, label, *rest in NAV:
        kids = rest[0] if rest else []
        ext = href.startswith('http')
        attrs = f' href="{href}"'
        if ext:
            attrs += ' class="ext" target="_blank" rel="noopener"'
        if key == cur or any(k == cur for k, _, _ in kids):
            attrs += ' aria-current="page"'
        if not kids:
            out.append(f'      <a{attrs}>{label}</a>')
            continue
        out.append('      <div class="dd">')
        out.append(f'        <a{attrs}>{label}</a>')
        out.append('        <div class="sub">')
        for k, h, l in kids:
            out.append(f'          <a href="{h}"' + (' aria-current="page"' if k == cur else '') + f'>{l}</a>')
        out.append('        </div>')
        out.append('      </div>')
    return '\n'.join(out)


def parse(path):
    s = path.read_text(encoding='utf-8')
    m = re.match(r'<!--meta\n(.*?)\n-->\n', s, re.S)
    meta = dict(line.split(':', 1) for line in m.group(1).splitlines()) if m else {}
    meta = {k.strip(): v.strip() for k, v in meta.items()}
    body = s[m.end():] if m else s
    scripts = ''
    sm = re.search(r'<!--scripts-->(.*)$', body, re.S)
    if sm:
        scripts, body = sm.group(1).strip(), body[:sm.start()]
    return meta, body.rstrip(), scripts


def main():
    staging = '--live' not in sys.argv   # 공개 전환 전에는 검색 차단
    total = 0
    for p in sorted(SRC.glob('*.html')):
        meta, body, scripts = parse(p)
        name = p.stem
        url = SITE + ('/' if name == 'index' else f'/{name}.html')
        html = LAYOUT.format(
            title=meta.get('title', '애월뮤직팩토리'), desc=meta.get('desc', ''),
            robots='<meta name="robots" content="noindex">\n' if (staging or name == '404') else '',
            url=url, site=SITE, base='<base href="/">\n' if name == '404' else '', bodycls=(' class="%s"' % meta['theme']) if meta.get('theme') else '', og=meta.get('og', 'og.jpg'), v=ASSET_V,
            nav=nav_html(meta.get('nav', name)), naver=NAVER,
            body=body, foot=FOOT, scripts=scripts.replace('{v}', ASSET_V))
        (ROOT / f'{name}.html').write_text(html, encoding='utf-8')
        n = len(re.findall(r'class="[^"]*\btodo\b', html))
        total += n
        print(f'{name}.html' + (f'  · 확인 필요 {n}' if n else ''))
    robots = 'User-agent: *\nDisallow: /\n' if staging else f'User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n'
    (ROOT / 'robots.txt').write_text(robots, encoding='utf-8')
    pages = [p.stem for p in sorted(SRC.glob('*.html')) if p.stem != '404']
    (ROOT / 'sitemap.xml').write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + ''.join(f'  <url><loc>{SITE}{"/" if n == "index" else "/" + n + ".html"}</loc></url>\n' for n in pages)
        + '</urlset>\n', encoding='utf-8')
    print(f'— 확인 필요 합계 {total}건 · {"시험 게시(검색 차단)" if staging else "공개(검색 허용)"}')
    if '--check' in sys.argv and total:
        sys.exit(1)


if __name__ == '__main__':
    main()
