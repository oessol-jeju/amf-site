# 애월뮤직팩토리 홈페이지 (aewolmusicfactory.com)

정적 HTML · GitHub Pages · 대관 접수는 Google Apps Script(시트·메일·캘린더).

| 바꿀 것 | 파일 | 그다음 |
|---|---|---|
| 공연 편성(달력) | `assets/data/schedule.json` — 달마다 `published: true` | `./deploy.sh "11월 편성"` |
| 대관 요금 | `assets/data/pricing.json` — 숫자만, `version` 올림. 공개는 `confirmed: true` | `./deploy.sh "요금 갱신"` |
| 공휴일 | `assets/data/holidays.json` | 〃 |
| 문안 | `_src/pages/*.html` (메뉴·푸터는 `build.py` 위쪽) | 〃 |

- `python3 build.py` 가 `_src/pages` 에 머리·메뉴·푸터를 씌워 루트에 `*.html` 을 만든다. 루트 html 은 직접 고치지 않는다.
- 점선 노란 표시(`.todo`)는 확인이 필요한 사실. 2026-10-26 공개 전환 뒤 `./deploy.sh`는 공개판으로 올리며, 하나라도 남으면 멈춘다.
- 시험 주소(github.io·로컬)에서는 대관 신청이 실제로 전송되지 않는다. `aewolmusicfactory.com` 에서만 접수된다.
- 설계: 워크스페이스 `11_AMF공간/10_AMF운영/웹사이트/기획_AMF홈페이지_HTML이전_설계_v6.md`
