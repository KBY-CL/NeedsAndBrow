#!/bin/bash
# check-docs-sync.sh
# git commit 후 실행 — 문서 동기화 필요 여부를 Claude에게 알린다
#
# Claude Code PostToolUse 훅으로 호출됨
# stdin: {"tool_name":"Bash","tool_input":{"command":"..."},"tool_response":{...}}

INPUT=$(cat)

# git commit 명령이 포함된 경우에만 동작
if ! echo "$INPUT" | grep -q '"git commit'; then
  exit 0
fi

# 마지막 커밋에서 문서 파일이 변경되었는지 확인
DOCS_CHANGED=$(git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -cE "(CLAUDE\.md|\.claude/skills/)" || echo "0")

if [ "$DOCS_CHANGED" -eq "0" ]; then
  cat <<'MSG'
[sync-docs 확인 필요]
이번 커밋에 CLAUDE.md 또는 .claude/skills/ 변경이 없었습니다.
구현 내용이 문서와 일치하는지 확인이 필요할 수 있습니다.
sync-docs 스킬 실행 여부를 검토하세요.
MSG
fi

exit 0
