
# Plan: Fixare Lead Tracking pentru Challenge-7-Zile (OAuth + Email)

## Problema Identificată

Când utilizatorii se autentifică cu **Google sau Apple** pe pagina `/challenge-7-zile`:
1. **Nu se salvează în `email_leads`** - funcția `saveLeadBeforeAuth` este apelată doar pentru email/password auth
2. **Nu se creează/linkuiește CRM profile** - `crm_contact_profiles.user_id` rămâne NULL
3. **`trackChallengeStarted` nu este apelată** - funcția există dar nu e utilizată

## Soluție în 3 Pași

### Pas 1: Salvare Lead după OAuth Redirect (AuthContext)
Când utilizatorul revine din OAuth pe `/challenge`, vom salva lead-ul cu email-ul din `session.user.email`.

Modificări în `src/context/AuthContext.tsx`:
- La evenimentul `SIGNED_IN`, verificăm dacă URL-ul curent este `/challenge`
- Dacă da, salvăm email-ul în `email_leads` cu `lead_magnet: 'challenge_oauth'`
- Creăm/updatăm `crm_contact_profiles` cu `user_id` linkuit

### Pas 2: Trigger trackChallengeStarted automat (Challenge.tsx)
Adăugăm un `useEffect` în pagina Challenge care:
- Verifică dacă utilizatorul e autentificat
- Apelează `trackChallengeStarted()` automat la prima vizită
- Actualizează `challenge_started_at` în CRM

### Pas 3: Linkuire CRM Contact cu Auth User
Când se creează sau găsește un contact CRM (în `useActivityTracker`):
- Verificăm dacă `user_id` este NULL
- Dacă da, îl setăm cu ID-ul utilizatorului curent

---

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `src/context/AuthContext.tsx` | Salvare lead OAuth + creare CRM profile |
| `src/pages/Challenge.tsx` | Apelare `trackChallengeStarted()` la mount |
| `src/hooks/useActivityTracker.ts` | Update `user_id` pe contactele existente |

---

## Detalii Tehnice

### AuthContext.tsx - Modificări
```typescript
// În onAuthStateChange, după SIGNED_IN:
if (event === 'SIGNED_IN' && session?.user) {
  // Salvează lead pentru OAuth dacă vine din challenge
  const fromChallenge = window.location.pathname.includes('/challenge');
  if (fromChallenge && session.user.email) {
    // Insert în email_leads
    supabase.from('email_leads').insert({
      email: session.user.email,
      lead_magnet: 'challenge_oauth',
      source: 'challenge-7-zile-oauth',
      metadata: { 
        auth_provider: session.user.app_metadata?.provider || 'unknown',
        signup_date: new Date().toISOString()
      }
    }).then(() => {}).catch(() => {});
    
    // Upsert CRM contact cu user_id
    supabase.from('crm_contact_profiles')
      .upsert({
        email: session.user.email,
        user_id: session.user.id,
        funnel_stage: 'engaged',
        lead_source: 'challenge_oauth',
        account_created_at: new Date().toISOString()
      }, { onConflict: 'email' })
      .then(() => {}).catch(() => {});
  }
}
```

### Challenge.tsx - Trigger automat
```typescript
const { trackChallengeStarted, isAuthenticated } = useChallengeProgress();

useEffect(() => {
  if (isAuthenticated) {
    trackChallengeStarted();
  }
}, [isAuthenticated, trackChallengeStarted]);
```

---

## Rezultat Așteptat

După implementare:
- ✅ Lead-urile OAuth vor fi salvate în `email_leads` cu `lead_magnet: 'challenge_oauth'`
- ✅ CRM contacts vor avea `user_id` setat corect
- ✅ `challenge_started_at` se va popula automat când utilizatorul intră în Challenge
- ✅ Timeline-ul de activități va fi vizibil în Admin CRM

---

## Timp Estimat
~10 minute implementare
