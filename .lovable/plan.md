

# Fix: Meta Pixel Lead - doar pe /challenge

## Problema

Pixelul Meta inregistreaza "Lead" la fiecare autentificare (Google, Apple, email) pe ORICE pagina din aplicatie, prin `AuthContext.tsx`. Asta inseamna ca un utilizator care se logheaza pe /dashboard sau /settings tot genereaza un eveniment Lead, ceea ce corupteaza datele din Meta Ads.

## Solutia

### 1. Sterge trackLead() din AuthContext.tsx

Eliminam apelul `trackLead()` din event-ul `SIGNED_IN` din `AuthContext.tsx` (liniile 60-67). Acest apel nu trebuie sa fie global - Lead-ul trebuie trackuit doar in contextul specific al funnel-ului (challenge, core4, mind coach).

**Ce se sterge:**
```typescript
// Se elimina din AuthContext.tsx:
const leadTrackedKey = `fb_lead_tracked_${session.user.id}`;
const alreadyTracked = localStorage.getItem(leadTrackedKey);
if (!alreadyTracked) {
  trackLead();
  localStorage.setItem(leadTrackedKey, 'true');
}
```

### 2. Pastreaza trackLead() in locurile corecte

Aceste apeluri raman neschimbate:
- **ChallengeInlineAuth.tsx** - trackLead() la signup email din challenge (corect)
- **Core4LeadMagnet.tsx** - trackLead() la lead magnet Core4 (corect)  
- **MindCoachLanding.tsx** - trackLead() la Mind Coach (corect)

### 3. Adauga trackLead() pentru OAuth din challenge

In `AuthContext.tsx`, sectiunea "CHALLENGE OAUTH LEAD CAPTURE" (care deja verifica `window.location.pathname.includes('/challenge')`) va primi si apelul `trackLead()`, astfel incat utilizatorii care vin prin Google/Apple pe pagina de challenge sa fie trackuiti ca Lead.

**Ce se adauga in blocul challenge OAuth (dupa verificarea `fromChallenge`):**
```typescript
if (fromChallenge && session.user.email) {
  trackLead(); // <-- adaugat aici
  // ... restul codului existent
}
```

## Rezultat

- Lead se inregistreaza DOAR cand utilizatorul vine din:
  - /challenge (email signup via ChallengeInlineAuth)
  - /challenge (OAuth via AuthContext - Google/Apple)
  - /core4 lead magnet
  - /mind-coach landing
- Login-ul normal pe alte pagini NU mai genereaza Lead

## Fisiere modificate

- `src/context/AuthContext.tsx` - scoate trackLead global, adauga trackLead in blocul challenge OAuth

