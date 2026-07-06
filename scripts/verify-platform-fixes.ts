/**
 * Local verification for Wave 1 + Wave 2 platform fixes.
 * Run: bunx tsx scripts/verify-platform-fixes.ts
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getRequiredTier, PRO_REQUIRED_ROUTES, BASIC_ROUTES } from '../src/config/routeTiers';

let passed = 0;
let failed = 0;

function ok(name: string) {
  passed++;
  console.log(`  ✓ ${name}`);
}

function fail(name: string, detail: string) {
  failed++;
  console.error(`  ✗ ${name}: ${detail}`);
}

function assert(name: string, condition: boolean, detail = '') {
  if (condition) ok(name);
  else fail(name, detail || 'assertion failed');
}

console.log('\n=== Route tier fixes ===');
assert('/door requires basic (not pro)', getRequiredTier('/door') === 'basic');
assert('/door/week still basic', getRequiredTier('/door/week') === 'basic');
assert('/brotherhood requires pro', getRequiredTier('/brotherhood') === 'pro');
assert('/warrior-launch-accelerator requires elite', getRequiredTier('/warrior-launch-accelerator') === 'elite');
assert('/door in BASIC_ROUTES', BASIC_ROUTES.includes('/door'));
assert('/door not in PRO_REQUIRED_ROUTES', !PRO_REQUIRED_ROUTES.includes('/door'));

console.log('\n=== Paywall logic mirror (ProtectedRoute getUserTier) ===');
function mirrorGetUserTier(opts: {
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
}): 'free' | 'basic' | 'pro' | 'elite' {
  const { subscribed, subscriptionTier, subscriptionEnd } = opts;
  if (subscriptionEnd && new Date(subscriptionEnd).getTime() < Date.now()) return 'free';
  if (!subscribed) return 'free';
  if (!subscriptionTier) return 'free';
  const t = subscriptionTier.toLowerCase();
  if (t.includes('elite')) return 'elite';
  if (t.includes('pro')) return 'pro';
  if (t.includes('basic')) return 'basic';
  if (t.includes('trial')) return 'basic';
  return 'basic';
}

const past = new Date(Date.now() - 86400000).toISOString();
const future = new Date(Date.now() + 86400000 * 30).toISOString();
assert('lapsed subscriber → free', mirrorGetUserTier({ subscribed: true, subscriptionTier: 'pro', subscriptionEnd: past }) === 'free');
assert('unsubscribed → free', mirrorGetUserTier({ subscribed: false, subscriptionTier: 'basic', subscriptionEnd: future }) === 'free');
assert('active basic → basic', mirrorGetUserTier({ subscribed: true, subscriptionTier: 'basic', subscriptionEnd: future }) === 'basic');
assert('active pro → pro', mirrorGetUserTier({ subscribed: true, subscriptionTier: 'pro', subscriptionEnd: future }) === 'pro');

console.log('\n=== Source file regressions ===');
const root = join(process.cwd());

function fileIncludes(rel: string, needle: string, label: string) {
  const p = join(root, rel);
  if (!existsSync(p)) return fail(label, `missing ${rel}`);
  const content = readFileSync(p, 'utf8');
  assert(label, content.includes(needle));
}

fileIncludes('src/components/ui/TextToSpeechButton.tsx', 'VITE_SUPABASE_PUBLISHABLE_KEY', 'TTS uses PUBLISHABLE_KEY');
const tts = readFileSync(join(root, 'src/components/ui/TextToSpeechButton.tsx'), 'utf8');
assert('TTS does not reference ANON_KEY', !tts.includes('VITE_SUPABASE_ANON_KEY'));

fileIncludes('src/components/blog/BlogArticle.tsx', 'DOMPurify.sanitize', 'BlogArticle uses DOMPurify');
fileIncludes('.gitignore', '.env', '.env in gitignore');
fileIncludes('.env.example', 'VITE_SUPABASE_PUBLISHABLE_KEY', '.env.example documents keys');

const gameContent = readFileSync(join(root, 'src/components/GameContent.tsx'), 'utf8');
assert('GameContent uses factMapService', gameContent.includes("from '@/services/factMapService'"));
assert('GameContent no monthlyMissions localStorage', !gameContent.includes("localStorage.getItem('monthlyMissions')"));

const factSimplified = readFileSync(join(root, 'src/components/FactMapSimplified.tsx'), 'utf8');
assert('FactMapSimplified uses createFoundationMap', factSimplified.includes('createFoundationMap'));
assert('FactMapSimplified no factMaps localStorage save', !factSimplified.includes("localStorage.setItem('factMaps'"));

console.log('\n=== Edge function auth patches (static) ===');
const mustRequireUser = [
  'warrior-ai-coach', 'platform-assistant', 'personal-power-coach', 'task-coach-breakdown',
  'generate-widget-config', 'beliefs-coach', 'generate-script', 'mind-shift-chat', 'parse-pdf',
];
for (const fn of mustRequireUser) {
  const p = join(root, `supabase/functions/${fn}/index.ts`);
  const c = readFileSync(p, 'utf8');
  assert(`${fn} has requireUser`, c.includes('requireUser'));
}

const mustCron = [
  'send-lifecycle-emails', 'send-challenge-reminder', 'send-warrior-power-sequence',
  'napoleon-hill-notifications',
];
for (const fn of mustCron) {
  const c = readFileSync(join(root, `supabase/functions/${fn}/index.ts`), 'utf8');
  assert(`${fn} has requireCronOrAdmin`, c.includes('requireCronOrAdmin'));
}

const transactional = readFileSync(join(root, 'supabase/functions/send-transactional-email/index.ts'), 'utf8');
assert('send-transactional-email uses authorizeTransactionalEmail', transactional.includes('authorizeTransactionalEmail'));

const welcome = readFileSync(join(root, 'supabase/functions/send-challenge-welcome/index.ts'), 'utf8');
assert('send-challenge-welcome checks userId match', welcome.includes('user.id !== userId'));

const smsSend = readFileSync(join(root, 'supabase/functions/sms-send/index.ts'), 'utf8');
assert('sms-send requires service role', smsSend.includes('requireServiceRoleResponse'));

const migration = readFileSync(join(root, 'supabase/migrations/20260706120000_revoke_has_role_from_anon.sql'), 'utf8');
assert('migration revokes has_role from anon', migration.includes('REVOKE EXECUTE') && migration.includes('anon'));

console.log(`\n--- Local results: ${passed} passed, ${failed} failed ---\n`);
process.exit(failed > 0 ? 1 : 0);
