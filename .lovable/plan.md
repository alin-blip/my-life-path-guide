
# Plan: Corectare OAuth Redirect și Branding pentru warriorsos.com

## Problema Identificată

Din analiza logurilor și a codului:

1. **Codul este corect** - toate apelurile OAuth folosesc `lovable.auth.signInWithOAuth` cu `redirect_uri: window.location.origin` (adică `https://warriorsos.com`)

2. **Problema este de configurare platformă** - ecranul Google de permisiuni arată „Remix of Rowarriorio" deoarece acesta este numele aplicației OAuth configurat în Google Cloud Console prin Lovable

3. **Eroare anterioară confirmate în logs**:
   ```
   "error":"missing OAuth secret"
   "path":"/authorize"
   "referer":"https://warriorsos.com/challenge"
   ```
   → Aceasta era de la încercarea anterioară cu bypass Supabase direct

## Ce Trebuie Configurat (Platformă, nu cod)

### Pas 1: Verificare/Configurare Domeniu Custom în Lovable

Accesează **Settings → Domains** în Lovable și asigură-te că:
- `warriorsos.com` este adăugat ca domeniu custom
- `www.warriorsos.com` este de asemenea adăugat (dacă îl folosești)
- Unul dintre ele este setat ca **Primary**

### Pas 2: Configurare OAuth Branding în Lovable Cloud

Pentru a schimba numele afișat în ecranul de permisiuni Google/Apple:

1. Deschide **Cloud Dashboard** (butonul de mai jos)
2. Navighează la **Users → Authentication Settings → Sign In Methods → Google**
3. Verifică dacă poți personaliza numele aplicației OAuth
4. Dacă folosești credențiale proprii (BYOK), schimbă numele în Google Cloud Console → OAuth consent screen

### Pas 3: Verificare Redirect URLs în Google Cloud Console

Dacă ai credențiale OAuth proprii configurate:
1. Accesează [Google Cloud Console](https://console.cloud.google.com/)
2. Navighează la **APIs & Services → Credentials**
3. Editează OAuth 2.0 Client ID-ul folosit
4. În **Authorized redirect URIs** adaugă:
   - `https://warriorsos.com`
   - `https://warriorsos.com/challenge`
   - `https://warriorsos.com/auth`
5. În **OAuth consent screen**:
   - Schimbă **Application name** din „Remix of Rowarriorio" în „WarriorOS" sau „Have It All Lifestyle"
   - Adaugă `warriorsos.com` în **Authorized domains**

## Acțiuni Disponibile Acum

Poți accesa Cloud Dashboard-ul pentru a verifica și configura setările OAuth:

## Rezumat

| Aspect | Status | Soluție |
|--------|--------|---------|
| Cod OAuth | ✅ Corect | Nu necesită modificări |
| Redirect URL în cod | ✅ `window.location.origin` | Corect |
| Branding „Remix of..." | ❌ Configurare platformă | Schimbă în Google Cloud Console / Lovable Cloud Settings |
| Domeniu custom | ⚠️ De verificat | Asigură-te că `warriorsos.com` e Primary în Settings → Domains |

## Notă Importantă

Lovable Cloud gestionează OAuth prin bridge-ul `oauth.lovable.app`. Când ai un domeniu custom și vrei branding personalizat, opțiunea recomandată este să configurezi propriile credențiale OAuth (BYOK - Bring Your Own Keys) în **Cloud Dashboard → Users → Authentication Settings → Google**, unde poți adăuga Client ID și Client Secret din Google Cloud Console cu numele și brandingul dorit.
