#!/usr/bin/env bash
# Deploy Wave 1 + Wave 2 security fixes to Supabase production.
# Requires: SUPABASE_ACCESS_TOKEN (sbp_...) from https://supabase.com/dashboard/account/tokens
set -euo pipefail

cd "$(dirname "$0")/.."

PROJECT_REF="${SUPABASE_PROJECT_REF:-exsbnfmaadjyfblperas}"

if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "ERROR: SUPABASE_ACCESS_TOKEN is not set."
  echo "Generate one at https://supabase.com/dashboard/account/tokens"
  exit 1
fi

FUNCTIONS=(
  # Wave 1 — explicitly secured
  warrior-ai-coach
  platform-assistant
  personal-power-coach
  task-coach-breakdown
  generate-widget-config
  send-transactional-email
  send-challenge-welcome
  mind-coach-demo
  text-to-speech-demo
  sms-webhook
  # Wave 1 funnel + SMS
  send-life-score-results
  send-power-results
  send-vision-results
  sms-send
  sms-enroll
  marriage-quiz-analyze
  # Wave 2 — 13 AI functions
  beliefs-coach
  beliefs-executive-audit
  beliefs-fishbowl-feedback
  beliefs-reprogrammer
  generate-hero-journey-script
  generate-path-plan
  generate-script
  generate-story-script
  lifebook-mission-suggest
  mind-shift-chat
  mind-shift-suggest
  parse-pdf
  time-insights
  # Wave 2 — 13 cron functions
  send-challenge-day7-upgrade
  send-challenge-promo-sequence
  send-challenge-reactivation
  send-challenge-reminder
  send-challenge-upgrade
  send-early-bird-reminder
  send-goal-plan-email
  send-lifecycle-emails
  send-life-score-plan
  send-life-score-sequence
  send-marriage-sequence
  send-warrior-power-sequence
  napoleon-hill-notifications
)

echo "=== Deploying ${#FUNCTIONS[@]} edge functions to $PROJECT_REF ==="
npx supabase functions deploy --project-ref "$PROJECT_REF" --use-api "${FUNCTIONS[@]}"

echo ""
echo "=== Applying DB migration (revoke has_role from anon) ==="
npx supabase db push --include-all --project-ref "$PROJECT_REF"

echo ""
echo "=== Running live auth smoke tests ==="
bash scripts/edge-auth-live-smoke.sh
