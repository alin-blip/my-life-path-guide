
# Plan: Widget Autentificare Complet pe Pagina /challenge-7-zile

## Rezumat

Vom înlocui formularul simplu de pe pagina `/challenge-7-zile` (care colectează doar email + nume și redirecționează la `/auth`) cu un **widget complet de autentificare inline** care permite crearea contului direct pe landing page.

## Schimbări Vizuale

```text
ÎNAINTE (formular simplu):
┌─────────────────────────────────────────┐
│  Nume (opțional)                        │
│  Email                                  │
│  [Creează Cont Gratuit și Începe]       │
└─────────────────────────────────────────┘
         ↓
    Redirect → /auth
         ↓
    Creează cont acolo

DUPĂ (widget complet):
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐│
│  │  [G] Continuă cu Google             ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │  [🍎] Continuă cu Apple             ││
│  └─────────────────────────────────────┘│
│                                         │
│  ─────────── sau cu email ────────────  │
│                                         │
│  Email:           [________________]    │
│  Parolă:          [________________] 👁 │
│  Confirmă Parola: [________________] 👁 │
│  [indicator HIBP - parolă sigură/nu]    │
│                                         │
│  [   CREEAZĂ CONT ȘI ÎNCEPE GRATUIT   ] │
│                                         │
│  Ai deja cont? [Conectează-te]          │
└─────────────────────────────────────────┘
         ↓
    Cont creat INSTANT
         ↓
    Redirect → /challenge
```

## Flow Utilizator

1. User ajunge pe `/challenge-7-zile`
2. Vede videoul și widget-ul de autentificare dedesubt
3. Alege metoda de înregistrare:
   - **Click Google/Apple** → OAuth instant → Cont creat → Redirect `/challenge`
   - **Email + Parolă** → Completează formular → Cont creat → Redirect `/challenge`
4. User autentificat ajunge pe `/challenge` și poate începe Day 1

## Fișiere Afectate

| Fișier | Acțiune | Descriere |
|--------|---------|-----------|
| `src/components/challenge/ChallengeInlineAuth.tsx` | **CREARE** | Componentă nouă cu OAuth + email/parolă |
| `src/pages/Challenge7ZileLanding.tsx` | **MODIFICARE** | Înlocuire formular simplu (liniile 381-426) cu ChallengeInlineAuth |

## Funcționalități Widget

- **Butoane OAuth** - Google și Apple cu design oficial
- **Formular Email/Parolă** - cu confirmare parolă pentru signup
- **Toggle Show/Hide Parolă** - pentru ambele câmpuri
- **Verificare HIBP** - blochează parole compromise
- **Toggle Login/Signup** - pentru utilizatori existenți
- **Bilingv RO/EN** - bazat pe context
- **Salvare Lead** - email salvat în `email_leads` înainte de creare cont
- **Redirect automat** - către `/challenge` după succes

## Secțiune Tehnică

### Structura Componentei ChallengeInlineAuth

```tsx
interface Props {
  language: 'en' | 'ro';
  onSuccess?: () => void;
  utmParams?: { source: string; medium: string; campaign: string };
}

ChallengeInlineAuth
├── OAuth Section
│   ├── Google Button (lovable.auth.signInWithOAuth)
│   └── Apple Button (lovable.auth.signInWithOAuth)
├── Separator ("sau cu email")
├── Email/Password Form
│   ├── Email Input
│   ├── Password Input + Eye Toggle
│   ├── Confirm Password Input (doar signup) + Eye Toggle
│   ├── PasswordBreachIndicator (doar signup)
│   └── Submit Button
└── Mode Switcher (Login ↔ Signup)
```

### Dependențe Existente (fără instalări)

- `@lovable.dev/cloud-auth-js` - OAuth Google/Apple
- `@supabase/supabase-js` - signup/login cu email
- `usePasswordCheck` hook - verificare HIBP
- `PasswordBreachIndicator` - indicator vizual breach
- `SecureInput` - input-uri sigure
- `useSecurity` - validare email și logging

### Modificări Challenge7ZileLanding.tsx

Înlocuire liniilor 381-426 (formularul simplu) cu:

```tsx
import { ChallengeInlineAuth } from '@/components/challenge/ChallengeInlineAuth';

// În secțiunea Hero, sub video:
{!isSubscribed ? (
  <ChallengeInlineAuth 
    language={language}
    utmParams={{ source: utmSource, medium: utmMedium, campaign: utmCampaign }}
    onSuccess={() => {
      setIsSubscribed(true);
      setTimeout(() => navigate('/challenge'), 1500);
    }}
  />
) : (
  <Card className="...">
    <CheckCircle2 ... />
    <p>Cont pregătit! Se redirecționează...</p>
  </Card>
)}
```

### OAuth Redirect URL

Pentru OAuth, redirect-ul va fi setat la `/challenge`:
```tsx
const { error } = await lovable.auth.signInWithOAuth('google', {
  redirect_uri: `${window.location.origin}/challenge`,
});
```

### Salvare Lead + Creare Cont

1. Salvăm email-ul în `email_leads` (pentru tracking)
2. Creăm contul cu `supabase.auth.signUp`
3. Creăm subscriber cu `early_bird_expires_at`
4. Redirect la `/challenge`

## Beneficii

1. **Zero fricțiune** - contul se creează direct pe landing, fără redirect
2. **Opțiuni multiple** - Google, Apple sau email+parolă
3. **Securitate** - verificare parolă compromisă HIBP
4. **Conversie mai bună** - 1 click vs 2 pagini
5. **UX consistent** - același stil ca restul platformei
