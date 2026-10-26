#!/bin/bash
# AMF 홈페이지 게시 — 생성 → 커밋 → GitHub 푸시 (GitHub Pages가 1~2분 뒤 반영)
#   ./deploy.sh "바꾼 내용 한 줄"            공개 게시 (2026-10-26 전환 이후 기본 · 확인 필요 항목이 남아 있으면 멈춘다)
#   ./deploy.sh --staging "바꾼 내용 한 줄"  검색 차단판 (되돌릴 때만)
set -e
cd "$(dirname "$0")"
if [ "$1" = "--staging" ]; then shift; python3 build.py; else [ "$1" = "--live" ] && shift; python3 build.py --live --check; fi
git add -A
git commit -m "${1:-사이트 갱신}" || { echo "바뀐 것 없음"; exit 0; }
GIT_SSH_COMMAND="ssh -i ~/.ssh/amf_site_deploy -o IdentitiesOnly=yes" git push origin main
