
# Plan: Sistem Complet de Secvențe Email pentru Challenge-ul de 7 Zile

## Rezumat Executive

Vom crea un sistem automat de email marketing cu 3 secvențe principale, integrate cu infrastructura existentă Resend și tracking-ul de progres din `challenge_progress`. Fiecare email va include secțiunea **"Invită 1-3 Prieteni"** cu link-ul de referral personalizat.

---

## SECVENȚA 1: Welcome Email (Imediat după înregistrare)

### Trigger
Utilizatorul se înregistrează cu succes pe `/challenge-7-zile` (email/password sau OAuth)

### Conținut Email

**Subiect:** 🎉 Felicitări, Warrior! Challenge-ul "Have It All Lifestyle" Începe Acum!

**Structură:**
1. **Felicitări și Validare** - "Ai făcut primul pas. Majoritatea oamenilor nu ajung nici aici."

2. **Problema (ce pierzi fără plan)**
   - Fără viziune clară, trăiești pe pilot automat
   - Zilele trec fără progres real
   - Te simți copleșit, fără direcție
   - Reacționezi la viață în loc să o creezi

3. **Soluția (cele 7 zile)**
   ```text
   Ziua 1: Viziune & Claritate → Răspunzi la întrebări care îți schimbă perspectiva
   Ziua 2: Corp, Spirit & Relații → Obiective pentru sănătate și echilibru
   Ziua 3: Business & Domino Door → Sistemul de execuție săptămânală
   Ziua 4: Warrior Routine → Rutina ta zilnică automatizată
   Ziua 5: Accountability & Mind Coach → AI care te ține pe drumul cel bun
   Ziua 6: Control Idei → Eisenhower Matrix pentru focus
   Ziua 7: Continuitate & Creștere → Integrare completă
   ```

4. **CTA #1: Invită 1-3 Prieteni**
   ```text
   🎁 Ai o invitație exclusivă gratuită pentru prietenii tăi!
   
   Trimite-le acest mesaj:
   ---
   Tocmai am început acest challenge și am o invitație exclusivă gratuită pentru tine.
   
   Uite ce se întâmplă în următoarele 7 zile:
   • Ziua 1: Viziune & Claritate
   • Ziua 2: Corp, Spirit & Relații
   • Ziua 3: Business & Execuție
   • Ziua 4: Rutina Zilnică de Execuție
   • Ziua 5: Accountability & Mindset
   • Ziua 6: Gândire Strategică & Idei
   • Ziua 7: Continuitate & Creștere
   
   Alătură-te aici 👇
   {REFERRAL_LINK}
   ---
   ```

5. **CTA #2: Buton Principal**
   - **Text:** "Începe Ziua 1 Acum →"
   - **Link:** `https://warriorsos.com/challenge`

---

## SECVENȚA 2: Reactivare "Day 1 Incomplete" (5 Emailuri)

### Trigger
Utilizator înregistrat dar NU a completat Ziua 1 (`challenge_progress.day_number = 1 AND completed = false` sau nu există entry)

### Programare
- **Email 1:** După 24h de la înregistrare
- **Email 2:** După 48h (ziua 2)
- **Email 3:** După 72h (ziua 3)
- **Email 4:** După 5 zile
- **Email 5:** După 7 zile (ultima șansă)

### Conținut Detaliat

#### Email 1 (24h) - "Primul Pas"
**Subiect:** ⏰ {name}, ai uitat ceva important...

**Body:**
- Hook: "Ai făcut ceva rar ieri - ai decis să îți schimbi viața. Dar nu ai terminat ce ai început."
- Problemă: "Știi ce se întâmplă când amâni? Entuziasmul moare. Motivația dispare. Și peste o săptămână îți spui 'o să fac data viitoare'."
- Soluție: "Ziua 1 durează 15 minute. În 15 minute poți avea mai multă claritate decât în ultimii 5 ani."
- CTA: "Începe Ziua 1 Acum" → warriorsos.com/challenge/1
- **Secțiune Invită Prieteni** (copy-paste format)

#### Email 2 (48h) - "De ce amâni?"
**Subiect:** 🤔 E din cauză că nu ai timp, sau din cauză că ți-e frică de răspunsuri?

**Body:**
- Hook: "Mulți oameni nu încep pentru că le e frică să afle răspunsul la 'Ce vreau de fapt?'"
- Perspectivă: "Dar tocmai de asta challenge-ul există - să te ghideze pas cu pas, fără să te simți copleșit."
- Social proof: "492 de Warriori au completat Ziua 1 luna asta. Tu?"
- CTA: "Fă primii 5 minuți acum" → warriorsos.com/challenge/1
- **Secțiune Invită Prieteni**

#### Email 3 (72h) - "Ce pierzi"
**Subiect:** 📉 Costul de a nu avea un plan (e mai mare decât crezi)

**Body:**
- Hook: "În ultimele 72 de ore, alți Warriori și-au setat viziunea pentru 2026."
- Loss Aversion: 
  - "Fără plan clar = decizii reactive"
  - "Fără obiective = energie risipită"
  - "Fără direcție = frustrare zilnică"
- Urgență: "Nu rata momentum-ul. Ziua 1 e gata pentru tine."
- CTA: "Recuperează Ziua 1" → warriorsos.com/challenge/1
- **Secțiune Invită Prieteni**

#### Email 4 (5 zile) - "Ultimele locuri"
**Subiect:** 🔥 {name}, te mai așteptăm... dar nu mult

**Body:**
- Hook: "Au trecut 5 zile. Alți Warriori sunt deja la Ziua 5 - au rutina configurată și AI Coach activ."
- FOMO: "Fiecare zi care trece e o zi în care alții progresează și tu stagnezi."
- Empatie: "Înțeleg - viața e ocupată. Dar tocmai de asta ai nevoie de un sistem."
- CTA: "Începe astăzi" → warriorsos.com/challenge/1
- **Secțiune Invită Prieteni**

#### Email 5 (7 zile) - "Ultima șansă"
**Subiect:** 🚨 ULTIMA NOTIFICARE: Challenge-ul te așteaptă

**Body:**
- Hook: "Aceasta e ultima mea încercare de a te readuce."
- Direct: "Dacă nu începi azi, probabil nu vei începe niciodată."
- Opțiune de ieșire: "Dacă nu mai vrei să primești aceste emailuri, poți să te dezabonezi mai jos."
- CTA final: "DA, VREAU SĂ ÎNCEP" → warriorsos.com/challenge/1
- **Secțiune Invită Prieteni**

---

## SECVENȚA 3: Daily Challenge (7 Emailuri - Unul pe zi)

### Trigger
Utilizatorul este activ în challenge (are cont, nu s-a dezabonat)

### Programare
Zilnic, pe baza `created_at` din `challenge_progress` sau `email_leads`

### Structură Fiecare Email

Fiecare email va avea:
1. **Progress Bar** - "Ziua 2/7 • 28% complet"
2. **Ce ai realizat** - recap ziua anterioară
3. **Ce urmează azi** - beneficii specifice zilei
4. **CTA Principal** - link către ziua curentă
5. **Secțiune "Invită 1-3 Prieteni"** - mesaj contextual pentru ziua respectivă (preluat din `ChallengeInviteFriends.tsx`)

### Conținut pe Zile

| Ziua | Subiect | Focus Principal | Mesaj Invitație |
|------|---------|-----------------|-----------------|
| 1 | 🔥 Ziua 1: Viziunea ta pentru 2026 începe acum | Napoleon Hill, Fact Map, 4 zone | "Tocmai am început acest challenge..." |
| 2 | 💪 Ziua 2: Corp, Spirit & Echilibru | Obiective sănătate, relații | "Sunt în Ziua 2! Ieri mi-am setat viziunea..." |
| 3 | 🎯 Ziua 3: Business + Domino Door | Plan săptămânal, milestone | "Sunt în Ziua 3! Ce am realizat..." |
| 4 | ⚡ Ziua 4: Warrior Routine + AI Meditation | Vision Board, rutină | "Ziua 4! Am configurat..." |
| 5 | 🧠 Ziua 5: Accountability & Mind Coach | AI Coaching, transformare frici | "Ziua 5! Accountability Coach..." |
| 6 | 💡 Ziua 6: Control Mental & Idei | Eisenhower Matrix, Idea List | "Ziua 6! Control Mental..." |
| 7 | 🏆 Ziua 7: Finalizare & Upgrade | Recap, ofertă Premium | "Tocmai am terminat challenge-ul!" |

---

## SECVENȚA 4: Upgrade Sequence (După Ziua 2, fără abonament)

### Trigger
`challenge_progress.day_number = 2 AND completed = true` + `subscribers.subscribed = false`

### Programare
- **Email 1:** Imediat după completarea Zilei 2
- **Email 2:** După 24h
- **Email 3:** După 48h
- **Email 4:** După 72h
- **Email 5:** După 5 zile (final)

### Conținut Detaliat

#### Email 1 - "Ai terminat primii 2 pași!"
**Subiect:** 🎉 Felicitări pentru Ziua 2! Acum vine partea bună...

**Body:**
- Celebrare: "Ai completat 2 zile! Ești în top 30% dintre cei care încep."
- Teaser: "Zilele 3-7 sunt unde se întâmplă magia ADEVĂRATĂ:"
  - Ziua 3: Business Plan + Domino Door (sistemul de execuție)
  - Ziua 4: Vision Board AI + Meditație personalizată
  - Ziua 5: Accountability Coach care știe TOT ce ai de făcut
  - Ziua 6: Control asupra ideilor care te distrag
  - Ziua 7: Integrare completă
- Urgență: "Early Bird Trial: 7 zile gratuite - activează acum"
- CTA: "Activează Trial Gratuit" → warriorsos.com/pricing
- **Secțiune Invită Prieteni**

#### Email 2 - "Ce pierzi fără upgrade"
**Subiect:** 📉 Zilele 1-2 sunt doar fundația. Fără 3-7 pierzi totul.

**Body:**
- Hook: "Ai viziunea. Ai obiectivele. Dar fără SISTEM, totul rămâne pe hârtie."
- Ce pierzi:
  - ❌ Fără Domino Door = fără execuție săptămânală
  - ❌ Fără AI Coach = nimeni nu te ține responsabil
  - ❌ Fără Mind Coach = fricile te blochează
  - ❌ Fără Idea Control = ideile noi te distrag
- CTA: "Nu lăsa viziunea să moară" → warriorsos.com/pricing
- **Secțiune Invită Prieteni**

#### Email 3 - "Alții progresează"
**Subiect:** ⚡ Alții sunt deja la Ziua 5. Tu?

**Body:**
- FOMO: "Warriorii care au activat trial-ul imediat sunt deja la Ziua 5."
- Testimonial: Quote de la un user care a completat
- Reminder: "Trial-ul e GRATUIT 7 zile. Zero risc."
- CTA: "Ajunge-i din urmă" → warriorsos.com/pricing
- **Secțiune Invită Prieteni**

#### Email 4 - "Ofertă specială"
**Subiect:** 🎁 Ultima șansă: 50% off primul an

**Body:**
- Exclusivitate: "Pentru că ai completat Zilele 1-2, îți ofer ceva special."
- Ofertă: "50% reducere la abonamentul anual - doar pentru tine."
- Scarcity: "Valabil 48 ore."
- CTA: "Activează Oferta" → warriorsos.com/pricing
- **Secțiune Invită Prieteni**

#### Email 5 - "Decizie finală"
**Subiect:** 🚨 Azi e ultima zi pentru ofertă

**Body:**
- Direct: "Ai două opțiuni: activezi trial-ul gratuit SAU pierzi tot progresul."
- Recap ce au făcut: "Viziune 2026 ✅, Obiective Corp/Spirit/Relații ✅"
- Final CTA: "VREAU SĂ CONTINUI" → warriorsos.com/pricing
- Dezabonare: Link clar
- **Secțiune Invită Prieteni**

---

## Arhitectură Tehnică

### Fișiere Noi de Creat

```text
supabase/functions/
├── send-challenge-welcome/index.ts       # Welcome email imediat după signup
├── send-challenge-daily/index.ts         # Secvența zilnică (7 emailuri)
├── send-challenge-reactivation/index.ts  # Reactivare Day 1 incomplete (5 emailuri)
├── send-challenge-upgrade/index.ts       # Upgrade sequence (5 emailuri)
```

### Modificări Frontend

```text
src/components/challenge/ChallengeInlineAuth.tsx
  → Adaugă apel la `send-challenge-welcome` după signup reușit
```

### Tabele Database

Vom folosi tabelul existent `email_sequence_log` cu `sequence_type`:
- `challenge_welcome` - welcome email
- `challenge_daily` - emailuri zilnice 1-7
- `challenge_reactivation` - reactivare incomplete
- `challenge_upgrade` - upgrade sequence

### Cron Jobs (SQL)

Vom configura cron jobs pentru executarea automată a secvențelor:
- **Zilnic la 09:00** - `send-challenge-daily`
- **Zilnic la 10:00** - `send-challenge-reactivation`
- **Zilnic la 11:00** - `send-challenge-upgrade`

### Template Email Base

Toate emailurile vor folosi:
- **From:** `"WarriorOS" <noreply@warriorsos.com>` (sau domeniul verificat în Resend)
- **Design:** Dark theme consistent cu brandul
- **Footer:** Unsubscribe link + tracking pixel
- **Secțiune "Invită Prieteni":** Copy-paste box cu mesajul + link referral

---

## Tracking & Analytics

### Metrici de Urmărit
- Open Rate per email/secvență
- Click Rate pe CTA-uri
- Conversion Rate (reactivare → completare, upgrade → subscriber)
- Referral Rate (câți invită prieteni)

### Implementare
- Tracking pixel existent (`track-email-open`)
- Link-uri cu UTM parameters
- Logging în `email_sequence_log`

---

## Secțiune Tehnică Detaliată

### Structura Edge Function (Exemplu: send-challenge-welcome)

```typescript
// Pseudocod structură
1. Primește webhook de la frontend cu {email, name, userId}
2. Generează tracking_id unic
3. Generează referral_link din userId
4. Construiește HTML cu:
   - Personalizare (name)
   - Secțiune problemă/beneficiu
   - Secțiune "Invită Prieteni" cu referral_link
   - CTA către warriorsos.com/challenge
   - Tracking pixel
5. Trimite via Resend API
6. Loghează în email_sequence_log
7. Returnează success/error
```

### Logică Determinare Stare User

```sql
-- User care trebuie reactivat (Day 1 incomplete)
SELECT u.email, u.name 
FROM email_leads u
LEFT JOIN challenge_progress p ON u.user_id = p.user_id AND p.day_number = 1
WHERE (p.completed IS NULL OR p.completed = false)
  AND u.created_at < NOW() - INTERVAL '24 hours'
  AND u.subscribed = true;

-- User pentru upgrade sequence (Day 2 complete, no subscription)
SELECT p.user_id, u.email
FROM challenge_progress p
JOIN auth.users u ON p.user_id = u.id
LEFT JOIN subscribers s ON p.user_id = s.user_id
WHERE p.day_number = 2 AND p.completed = true
  AND (s.subscribed IS NULL OR s.subscribed = false);
```

---

## Checklist Implementare

1. [ ] Creare `send-challenge-welcome` Edge Function
2. [ ] Modificare `ChallengeInlineAuth.tsx` pentru trigger welcome
3. [ ] Creare `send-challenge-daily` Edge Function (7 templates)
4. [ ] Creare `send-challenge-reactivation` Edge Function (5 templates)
5. [ ] Creare `send-challenge-upgrade` Edge Function (5 templates)
6. [ ] Configurare cron jobs pentru execuție automată
7. [ ] Testare end-to-end pe cont de test
8. [ ] Verificare tracking pixel și unsubscribe
9. [ ] Deploy și monitorizare

---

## Timeline Estimat

| Fază | Durată |
|------|--------|
| Implementare Welcome Email | 1 sesiune |
| Implementare Daily Sequence | 1-2 sesiuni |
| Implementare Reactivation Sequence | 1 sesiune |
| Implementare Upgrade Sequence | 1 sesiune |
| Testare & Ajustări | 1 sesiune |

**Total:** 5-6 sesiuni de lucru
