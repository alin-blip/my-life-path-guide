#!/usr/bin/env bash
# Live smoke tests against deployed Supabase edge functions.
# NOTE: Results reflect DEPLOYED functions. Redeploy the branch for fixes to take effect live.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

URL="${VITE_SUPABASE_URL:-}"
KEY="${VITE_SUPABASE_PUBLISHABLE_KEY:-}"

if [ -z "$URL" ] || [ -z "$KEY" ]; then
  echo "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY"
  exit 1
fi

PASS=0
FAIL=0
BODY_FILE="/tmp/edge-smoke-body-$$.txt"

cleanup() { rm -f "$BODY_FILE"; }
trap cleanup EXIT

run_test() {
  local name="$1"
  local fn="$2"
  local expected="$3"
  local body_file="$4"
  local use_auth="${5:-yes}"

  local -a curl_args=(
    -s -o "$BODY_FILE" -w "%{http_code}"
    -X POST "$URL/functions/v1/$fn"
    -H "Content-Type: application/json"
    -H "apikey: $KEY"
  )

  if [ "$use_auth" = "yes" ]; then
    curl_args+=(-H "Authorization: Bearer $KEY")
  fi

  local status
  status=$(curl "${curl_args[@]}" --data-binary @"$body_file")

  local body_preview
  body_preview=$(head -c 180 "$BODY_FILE" | tr '\n' ' ')

  IFS=',' read -ra EXP <<< "$expected"
  local match=0
  for e in "${EXP[@]}"; do
    if [ "$status" = "$e" ]; then match=1; break; fi
  done

  if [ "$match" -eq 1 ]; then
    echo "  ✓ $name → HTTP $status"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $name → HTTP $status (expected ${expected}) — $body_preview"
    FAIL=$((FAIL + 1))
  fi
}

write_body() {
  local file="$1"
  local content="$2"
  printf '%s' "$content" > "$file"
}

echo ""
echo "=== Live edge function auth smoke tests ==="
echo "Target: $URL"
echo ""

write_body /tmp/b1.json '{"question":"test"}'
run_test "warrior-ai-coach rejects no auth" "warrior-ai-coach" "401" /tmp/b1.json no

write_body /tmp/b2.json '{"messages":[]}'
run_test "platform-assistant rejects no auth" "platform-assistant" "401" /tmp/b2.json no

write_body /tmp/b3.json '{"mode":"gratitude","payload":{"items":["a"]}}'
run_test "beliefs-coach rejects no auth" "beliefs-coach" "401" /tmp/b3.json no

write_body /tmp/b4.json '{"topic":"test"}'
run_test "generate-script rejects no auth" "generate-script" "401" /tmp/b4.json no

run_test "warrior-ai-coach rejects anon JWT" "warrior-ai-coach" "401" /tmp/b1.json yes

write_body /tmp/b5.json '{}'
run_test "parse-pdf rejects anon JWT" "parse-pdf" "401" /tmp/b5.json yes

write_body /tmp/b6.json '{"templateName":"burnout-results","recipientEmail":"attacker@example.com","templateData":{}}'
run_test "send-transactional-email rejects anon arbitrary send" "send-transactional-email" "401,403" /tmp/b6.json yes

write_body /tmp/b7.json '{"email":"test@example.com","userId":"00000000-0000-0000-0000-000000000001"}'
run_test "send-challenge-welcome rejects anon" "send-challenge-welcome" "401" /tmp/b7.json yes

write_body /tmp/b8.json '{}'
run_test "send-lifecycle-emails rejects anon" "send-lifecycle-emails" "401" /tmp/b8.json yes

run_test "send-challenge-reminder rejects anon" "send-challenge-reminder" "401" /tmp/b8.json yes

write_body /tmp/b9.json '{"phone_e164":"+10000000000","message":"test"}'
run_test "sms-send rejects anon" "sms-send" "401,403" /tmp/b9.json yes

write_body /tmp/b10.json '{"messages":[{"role":"user","content":"hi"}]}'
status=$(curl -s -o "$BODY_FILE" -w "%{http_code}" \
  -X POST "$URL/functions/v1/mind-coach-demo" \
  -H "Content-Type: application/json" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $KEY" \
  --data-binary @/tmp/b10.json)
if [ "$status" = "200" ] || [ "$status" = "429" ]; then
  echo "  ✓ mind-coach-demo public demo responds $status"
  PASS=$((PASS + 1))
else
  echo "  ✗ mind-coach-demo unexpected $status"
  FAIL=$((FAIL + 1))
fi

write_body /tmp/b11.json '{"plan":"ebook","guest_email":"test@example.com"}'
run_test "create-checkout guest path reachable" "create-checkout" "200,400,500" /tmp/b11.json yes

write_body /tmp/b12.json '{}'
status=$(curl -s -o "$BODY_FILE" -w "%{http_code}" \
  -X POST "$URL/functions/v1/stripe-webhook" \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/b12.json)
if [ "$status" = "400" ] || [ "$status" = "401" ]; then
  echo "  ✓ stripe-webhook rejects bad signature → HTTP $status"
  PASS=$((PASS + 1))
else
  echo "  ✗ stripe-webhook → HTTP $status (expected 400,401)"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "--- Live results: $PASS passed, $FAIL failed ---"
echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "NOTE: Live failures usually mean edge functions from PR #4 are not deployed to Supabase yet."
  echo "Deploy branch cursor/platform-security-fixes-109d, then re-run: bash scripts/edge-auth-live-smoke.sh"
fi

exit $(( FAIL > 0 ? 1 : 0 ))
