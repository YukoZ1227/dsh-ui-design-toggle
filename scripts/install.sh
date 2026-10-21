#!/usr/bin/env sh
# dsh-ui-design-toggle one-click installer for macOS / Linux.
#
#   curl -fsSL https://raw.githubusercontent.com/YukoZ1227/dsh-ui-design-toggle/main/scripts/install.sh | bash
#
# Environment variables:
#   DSH_PROFILE   target profile (default: web)
#   DSH_VERSION   release tag to install (default: latest)
#   DSH_FROM_SOURCE=1  skip releases, install github:YukoZ1227/dsh-ui-design-toggle
set -eu

REPO="YukoZ1227/dsh-ui-design-toggle"
PACKAGE="dsh-ui-design-toggle"
PROFILE="${DSH_PROFILE:-web}"
VERSION="${DSH_VERSION:-}"

step() { printf '\033[36m==> %s\033[0m\n' "$1"; }
ok()   { printf '\033[32mOK  %s\033[0m\n' "$1"; }
warn() { printf '\033[33mWARN %s\033[0m\n' "$1"; }
fail() { printf '\033[31mERR %s\033[0m\n' "$1" >&2; exit 1; }

# 1. environment -----------------------------------------------------------
step "checking dsh and pnpm"
command -v dsh  >/dev/null 2>&1 || fail "dsh not found. Install DeepSeek Harness first: npm i -g @deepseek-ai/dsh"
command -v pnpm >/dev/null 2>&1 || fail "pnpm not found. Install it first: npm i -g pnpm (or corepack enable pnpm)"
ok "dsh $(dsh --version 2>/dev/null | tr -d '\r') · pnpm $(pnpm -v) · profile $PROFILE"

# 2. resolve the install source -------------------------------------------
TARGET=""
TMP_TGZ=""

if [ "${DSH_FROM_SOURCE:-0}" = "1" ]; then
  TARGET="github:$REPO"
  ok "source: GitHub repository ($TARGET)"
else
  step "looking up release assets"
  if [ -n "$VERSION" ]; then
    API="https://api.github.com/repos/$REPO/releases/tags/$VERSION"
  else
    API="https://api.github.com/repos/$REPO/releases/latest"
  fi

  # Extract the first *.tgz download URL without requiring jq.
  URL="$(curl -fsSL -H 'User-Agent: dsh-installer' --max-time 30 "$API" 2>/dev/null \
        | tr ',' '\n' \
        | grep -o '"browser_download_url"[[:space:]]*:[[:space:]]*"[^"]*\.tgz"' \
        | head -n 1 \
        | sed -e 's/.*"\(https[^"]*\)"/\1/')" || URL=""

  if [ -n "$URL" ]; then
    TMP_TGZ="$(mktemp "${TMPDIR:-/tmp}/$PACKAGE.XXXXXX.tgz")"
    step "downloading $(basename "$URL")"
    curl -fsSL --retry 2 --max-time 300 -o "$TMP_TGZ" "$URL" || fail "download failed: $URL"
    TARGET="$TMP_TGZ"
    ok "downloaded to $TMP_TGZ"
  else
    warn "no .tgz asset found (or the API is unreachable); falling back to source install"
    TARGET="github:$REPO"
  fi
fi

# 3. install ---------------------------------------------------------------
cleanup() { [ -n "$TMP_TGZ" ] && [ -f "$TMP_TGZ" ] && rm -f "$TMP_TGZ"; }
trap cleanup EXIT INT TERM

step "running: dsh plugin --profile $PROFILE add $TARGET"
dsh plugin --profile "$PROFILE" add "$TARGET" || fail "dsh plugin add failed"

# 4. verify ----------------------------------------------------------------
step "verifying profile configuration"
DUMP="$(dsh --profile "$PROFILE" --dump-config 2>&1 || true)"
printf '%s\n' "$DUMP" | grep -q 'ui-design-toggle' \
  || fail "ui-design-toggle not found in --dump-config; run: dsh --profile $PROFILE --dump-config"
ok "ui-design-toggle entry is present"

if printf '%s\n' "$DUMP" | grep -q 'skipping profile bundle'; then
  warn "some bundle is being skipped; inspect with: dsh --profile $PROFILE --dump-config"
fi

printf '\n'
ok "Installed. Restart 'dsh web' (or refresh the page); the sidebar shows the \"UI design skill\" switch."
