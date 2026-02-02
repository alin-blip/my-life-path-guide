

# Plan: Secvență de 5 Emailuri Promoționale pentru Challenge

## Rezumat

Voi crea o Edge Function nouă care trimite o secvență de 5 emailuri către cele **170 lead-uri existente** din lead magnets non-challenge (vision_2026_quiz, vision_board, life_score, warrior_power, etc.) pentru a le invita la Challenge-ul gratuit de 7 zile.

---

## Fișiere de Creat/Modificat

| Fișier | Acțiune |
|--------|---------|
| `supabase/functions/send-challenge-promo-sequence/index.ts` | **CREARE** - Edge Function pentru secvența de 5 emailuri |
| `supabase/config.toml` | **MODIFICARE** - Adaugă configurație pentru noua funcție |

---

## Audiența Țintă

**170 lead-uri active** din:
- vision_2026_quiz: 59 leads
- vision_board: 52 leads
- life_score_60s: 24 leads
- life_score: 21 leads
- warrior_power: 13 leads
- vision_board_2026: 1 lead

---

## Secvența de 5 Emailuri

### Email 1: Lansare (Trimis Imediat)
**Subject:** 🎁 Am ceva special pentru tine — Challenge GRATUIT de 7 Zile
- Hook personalizat: "Ai făcut deja primul pas testând unul dintre instrumentele noastre..."
- Prezentare Challenge cu toate cele 7 zile
- CTA: "Începe Ziua 1 Acum →" → `https://warriorsos.com/challenge-7-zile`

### Email 2: Problema (+24h)
**Subject:** ❌ De ce 92% dintre oameni eșuează (și cum să fii în cei 8%)
- Hook: Minciunile pe care ni le spunem ("voi începe luni...")
- Problema lipsei de sistem
- CTA: "Fii în cei 8% →"

### Email 3: Transformarea (+48h)
**Subject:** 🔥 Ce se întâmplă în fiecare zi din Challenge
- Detaliere completă ziua cu ziua
- Beneficiul final: "După 7 zile, vei ști EXACT ce să faci"
- CTA: "Începe Transformarea →"

### Email 4: Urgență (+72h)
**Subject:** ⏰ Locurile pentru Challenge sunt limitate
- Urgență: "Nu putem susține asta pentru totdeauna"
- FOMO: Ce pierzi fără sistem
- CTA: "Asigură-ți Locul ACUM →"

### Email 5: Ultimul Reminder (+96h)
**Subject:** 👋 Ultima șansă, [Name]
- Recapitulare finală
- Touch personal
- CTA: "Ultimele 24 de ore → Începe ACUM"

---

## Specificații Tehnice

### Edge Function: send-challenge-promo-sequence

```text
Moduri de Operare:
┌─────────────────────────────────────────────────┐
│  MANUAL MODE                                     │
│  POST { email: "test@x.com", emailNumber: 1 }   │
│  → Trimite email specific la adresa specificată  │
├─────────────────────────────────────────────────┤
│  AUTOMATIC MODE                                  │
│  POST {} sau GET                                │
│  → Procesează toate lead-urile eligibile        │
│  → Verifică intervalul de 24h între emailuri    │
│  → Trimite emailul următor în secvență (1-5)    │
└─────────────────────────────────────────────────┘
```

### Logica de Trimitere

```text
Pentru fiecare lead din email_leads:
  1. Verifică dacă lead_magnet e în lista țintă
  2. Verifică dacă e subscribed = true
  3. Verifică în email_sequence_log ce emailuri au fost trimise
  4. Dacă nu a primit nimic → Trimite Email 1
  5. Dacă a primit Email N și au trecut 24h → Trimite Email N+1
  6. Stop la Email 5
```

### Tracking și Logging

- **Tracking Pixel:** Pentru open rate
- **Unsubscribe Link:** Dezabonare cu un click
- **UTM Parameters:** `utm_source=email&utm_campaign=challenge_promo&utm_content=email_X`
- **Log în email_sequence_log:** `sequence_type = 'challenge_promo'`

### Configurare config.toml

```toml
[functions.send-challenge-promo-sequence]
verify_jwt = false
```

---

## Design Email Template

- **From:** `WarriorOS <noreply@warriorsos.com>` (domeniu verificat)
- **Culori:** Dark theme (#0a0a0a background), accent orange (#f59e0b)
- **CTA Button:** Gradient orange (#f59e0b → #ea580c)
- **Footer:** Link dezabonare + "WarriorOS • Have It All Lifestyle Challenge"

---

## Workflow de Execuție

```text
[Invocă Funcția - PRIMUL EMAIL]
         ↓
[170 lead-uri primesc Email 1 imediat]
         ↓
[Setup CRON Job zilnic - opțional]
         ↓
[La fiecare 24h, funcția verifică și trimite emailul următor]
         ↓
[După 5 zile, secvența e completă]
```

---

## Cum să Trigger Secvența

### Opțiunea 1: Invocă Manual din Browser/Postman
```bash
POST https://exsbnfmaadjyfblperas.supabase.co/functions/v1/send-challenge-promo-sequence
Headers: { "Authorization": "Bearer YOUR_ANON_KEY" }
Body: {} # empty pentru automatic mode
```

### Opțiunea 2: Cron Job Zilnic (Recomandat)
Configurezi un cron job în Supabase care invocă funcția zilnic la ora 10:00.

---

## Rezultat Așteptat

După implementare și invocare:
- ✅ 170 lead-uri primesc Email 1 imediat
- ✅ Email 2-5 se trimit automat la interval de 24h (cu cron)
- ✅ Toate emailurile au CTA spre `/challenge-7-zile`
- ✅ Tracking complet (opens, clicks, unsubscribes)
- ✅ Domeniu verificat `warriorsos.com` - deliverabilitate maximă

---

## Timp Estimat
~15 minute pentru creare funcție + deploy + testare

