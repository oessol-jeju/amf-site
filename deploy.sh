#!/bin/bash
# AMF 홈페이지 게시 — 생성 → 커밋 → GitHub 푸시 (GitHub Pages가 1~2분 뒤 반영)
#   ./deploy.sh "바꾼 내용 한 줄"            공개 게시 (2026-10-26 전환 이후 기본 · 확인 필요 항목이 남아 있으면 멈춘다)
#   ./deploy.sh --staging "바꾼 내용 한 줄"  검색 차단판 (되돌릴 때만)
#
# 기기별 올리기 (2026-11-08)
#   맥북  origin = SSH, 배포 키 ~/.ssh/amf_site_deploy
#   윈도우 PC  origin = HTTPS, Git Credential Manager(GitHub 로그인 한 번 → 저장). Git Bash에서 실행
set -e
cd "$(dirname "$0")"
export PYTHONUTF8=1                                    # 윈도우 콘솔(cp949)에서 build.py 한글 출력 오류 방지
PY=python3; "$PY" -c "" 2>/dev/null || PY=python       # 윈도우는 python3 가 스토어 바로가기라 python 으로
if [ "$1" = "--staging" ]; then shift; "$PY" build.py; else [ "$1" = "--live" ] && shift; "$PY" build.py --live --check; fi
git add -A
git commit -m "${1:-사이트 갱신}" || echo "새로 바뀐 것 없음 — 밀린 커밋이 있으면 올림"
GIT_SSH_COMMAND="ssh -i ~/.ssh/amf_site_deploy -o IdentitiesOnly=yes" git push origin main
