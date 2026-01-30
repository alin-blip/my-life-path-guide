
# Plan: Restructurare Challenge 7 Zile - Flow Final

## Rezumat Modificări

Restructurarea completă a Challenge-ului de 7 zile conform planului final:
- **Zilele 1-2**: FREE (cu invitații referral)
- **Zilele 3-7**: TRIAL (cu Early Bird upgrade)
- Fiecare zi are un flow clar și task-uri specifice

---

## ZIUA 1 - VIZIUNE + DECLARAȚIE (FREE)

### Task-uri noi:
1. **Viziune Napoleon Hill** - rămâne (1 an, 4 zone)
2. **Scrie Declarația** - rămâne (citire AM/PM)
3. **Join Community** - NOU - buton → `/brotherhood?tab=tribes` (tribul Warrior)
4. **Invită 1-3 Prieteni** - NOU - buton cu mesaj embedded

### Mesaj Referral (Română):
```
Tocmai am început acest challenge și am 3 invitații exclusive.
Vrei să faci acest challenge împreună cu mine?

Ziua 1: Viziune & Claritate
Ziua 2: Corp, Spirit & Relații
Ziua 3: Business & Execuție
Ziua 4: Rutina Zilnică de Execuție
Ziua 5: Accountability & Mindset
Ziua 6: Gândire Strategică & Idei
Ziua 7: Continuitate & Creștere

Alătură-te aici 👇
{REFERRAL_LINK}
```

### Fișiere modificate:
- `src/pages/ChallengeDay.tsx` - adaug task-uri pentru Join Community și Invite Friends
- `src/hooks/useAffiliateLink.ts` - adaug funcție pentru mesaj custom embedded

---

## ZIUA 2 - CORP + SPIRIT + RELAȚII (FREE)

### Task-uri actualizate:
1. **Obiective Corp** (2026 → 90 zile → 30 zile) → `/game-objectives?category=body`
2. **Obiective Spirit** (2026 → 90 zile → 30 zile) → `/game-objectives?category=being`
3. **Obiective Relații** (2026 → 90 zile → 30 zile) → `/game-objectives?category=balance` - NOU
4. **Rutine Corp + Spirit + Relații** - opțional, link → `/daily-flow`
5. **Community Share** - postează în comentarii

### Modificări:
- Adăugăm categoria Relații (Balance) la exerciții
- Păstrăm structura 2026 → 90 zile → 30 zile

---

## ZIUA 3 - BUSINESS + DOMINO DOOR (TRIAL ÎNCEPE)

### Task-uri consolidate:
1. **Business Vision + Plan** - AI Wizard ONE GO:
   - Business 1 an
   - 90 zile targets
   - First month milestone
   - Domino Door săptămânal (1 milestone + 4 chei + WHY pentru fiecare)
   
2. **Share în comunitate** - screenshot/copy-paste Domino Door

### Flow:
- Utilizatorul deschide `/game-objectives?category=business&wizard=full`
- Wizard-ul ghidează prin toate nivelurile: Annual → 90 days → Monthly → Weekly Door
- La final, Door-ul e setat cu milestone + 4 chei + task-uri

### Modificări:
- Eliminăm Relationships din Ziua 3 (mutat în Ziua 2)
- Adăugăm Domino Door integrat cu Business flow
- Actualizăm link-ul să deschidă wizard-ul complet

---

## ZIUA 4 - WARRIOR ROUTINE + VISION AI + MEDITAȚIE (TRIAL)

### Task-uri:
1. **Vision AI** - generează imagini AI pentru toate 4 cadranele → `/vision-board`
2. **Warrior Routine** - configurează rutina zilnică cu 1 click → `/daily-flow`
3. **Meditație Personalizată** - creează meditație bazată pe obiective → `/daily-flow`
4. **Start Execution** - începe prima execuție a rutinei

### Explicații adăugate:
- Meditația este personalizată pe obiectivele lor setate în Zilele 2-3
- Warrior Routine automatizează dimineața și seara

---

## ZIUA 5 - ACCOUNTABILITY COACH + MIND COACH (TRIAL)

### Task-uri:
1. **Accountability Coach** - știe ce e făcut/nefăcut → `/accountability-coach`
2. **Mind Coach** - transformă emoții negative în putere:
   - Angry → Power
   - Anxious → Calm Action
   - Stuck → Clarity
   - Procrastination → Momentum
3. **Share Breakthrough** - postează în comentarii

### Link-uri:
- `/accountability-coach` pentru status check
- `/mind-coach` pentru transformare emoțională

---

## ZIUA 6 - IDEA LIST (STRATEGIC FILTER) (TRIAL) - NOU

### Scopul Zilei 6:
- NU pentru execuție
- Pentru CONTROLUL IMPULSULUI
- Scoate ideile din cap fără să distrugă execuția setată în Ziua 3

### Task-uri:
1. **Creează Idea List** (Idea Parking Lot) → `/door?tab=weekly` (secțiunea Ideas)
2. **Clasifică ideile cu Eisenhower Matrix**:
   - Q1 Reactor (Important + Urgent) → Fă ACUM
   - Q2 Creator (Important + Not Urgent) → PLANIFICĂ ✨
   - Q3 Delegator (Not Important + Urgent) → DELEGĂ
   - Q4 Eliminator (Not Important + Not Urgent) → ȘTERGE
3. **Înțelege mesajul cheie**

### Mesaj Cheie:
```
"Ideas don't build freedom.
Execution over time does."

"Ideile nu construiesc libertatea.
Execuția în timp construiește."
```

### Explicații în UI:
- De ce este important să "parchezi" ideile
- Cum să nu lași ideile noi să distrugă focusul
- Cum să folosești cadranele Eisenhower

---

## ZIUA 7 - MEMBERSHIP + REFERRALS + CONTINUITY (TRIAL → CONVERSIE)

### Secțiuni:
1. **Recap** - ce ai realizat:
   - Viziune clară
   - Plan anual
   - 90-day targets
   - First month milestone
   - Weekly execution system
   - Control mental asupra ideilor
   
2. **Membership Options**:
   - Basic (fără AI)
   - Pro (AI + 50% referral)
   - Elite (Pro + Accelerator + Weekly Coaching + Coach Dashboard)

3. **Invite 1-3 Friends** - final push

### Mesaj Referral Final:
```
Tocmai am terminat acest challenge.

În primele zile, am obținut mai multă claritate decât în ani.

Acum am:
– O viziune clară
– Un plan anual
– Obiective pe 90 de zile
– Milestone-ul primei luni
– Sistem de execuție săptămânală
– Control asupra ideilor mele

Și am o invitație exclusivă gratuită pentru tine.

Alătură-te aici 👇
{REFERRAL_LINK}
```

---

## Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| `src/pages/Challenge.tsx` | Actualizez `challengeDays` array cu noile titluri și descrieri pentru toate 7 zilele |
| `src/pages/ChallengeDay.tsx` | Refactor complet `challengeContent` array cu noul curriculum pentru fiecare zi |
| `src/hooks/useAffiliateLink.ts` | Adaug funcție `shareWithCustomMessage(message)` pentru mesaje embedded |
| `src/components/challenge/day1/Day1InviteFriends.tsx` | **NOU** - component pentru invite cu mesaj embedded |
| `src/components/challenge/day1/Day1JoinCommunity.tsx` | **NOU** - component pentru join Brotherhood tribe |
| `src/components/challenge/ChallengeDay6Ideas.tsx` | **NOU** - component pentru Ziua 6 cu explicații Eisenhower |
| `src/components/challenge/ChallengeDay7Upgrade.tsx` | Actualizez cu noul recap și mesaj referral final |

---

## Detalii Tehnice

### 1. Challenge.tsx - Titluri Actualizate

```typescript
const challengeDays: ChallengeDay[] = [
  {
    day: 1,
    titleRo: "🔥 VIZIUNE + DECLARAȚIE",
    subtitleRo: "Viziune Napoleon Hill + Join Community + Invită Prieteni",
    focusAreas: ['body', 'being', 'balance', 'business']
  },
  {
    day: 2,
    titleRo: "💪✨💕 CORP + SPIRIT + RELAȚII",
    subtitleRo: "Obiective 2026 / 90 zile / 30 zile pentru toate 3 ariile",
    focusAreas: ['body', 'being', 'balance']
  },
  {
    day: 3,
    titleRo: "💰🎯 BUSINESS + DOMINO DOOR",
    subtitleRo: "Business Vision + 90 Days + Monthly + Weekly Door (ONE GO)",
    focusAreas: ['business']
  },
  {
    day: 4,
    titleRo: "⚡ WARRIOR ROUTINE + VISION AI + MEDITAȚIE",
    subtitleRo: "Rutină zilnică + Imagini AI + Meditație personalizată",
    focusAreas: ['body', 'being', 'balance', 'business']
  },
  {
    day: 5,
    titleRo: "🧠 ACCOUNTABILITY + MIND COACH",
    subtitleRo: "Status check + Transformare emoții în putere",
    focusAreas: ['body', 'being', 'balance', 'business']
  },
  {
    day: 6,
    titleRo: "💡 IDEA LIST (FILTRU STRATEGIC)",
    subtitleRo: "Controlul impulsului + Clasificare Eisenhower",
    focusAreas: ['business']
  },
  {
    day: 7,
    titleRo: "🏆 MEMBERSHIP + CONTINUITATE",
    subtitleRo: "Recap + Upgrade + Invită prieteni finali",
    focusAreas: ['body', 'being', 'balance', 'business']
  }
];
```

### 2. Day1InviteFriends.tsx - Component Nou

```typescript
// Folosește useAffiliateLink cu mesaj custom
const { referralLink, shareWithMessage } = useAffiliateLink();

const inviteMessage = language === 'ro' 
  ? `Tocmai am început acest challenge și am 3 invitații exclusive...`
  : `I just started this challenge and I've got 3 exclusive invites...`;

const handleInvite = () => {
  shareWithMessage(inviteMessage);
};
```

### 3. Day1JoinCommunity.tsx - Component Nou

```typescript
// Redirect către Brotherhood cu tab-ul Tribes selectat
const handleJoinCommunity = () => {
  navigate('/brotherhood?tab=tribes');
};
```

### 4. ChallengeDay6Ideas.tsx - Component Nou

Explicații despre:
- Scopul Idea List (parking lot pentru idei)
- Cum să nu distrugă execuția din Ziua 3
- Cum funcționează Eisenhower Matrix (4 cadrane)
- Buton → `/door?tab=weekly` (secțiunea Ideas)
- Mesaj cheie: "Ideas don't build freedom. Execution over time does."

### 5. Referral System - Early Bird Flow

- Zilele 1-2: Buton "Invită Prieteni" vizibil
- Zilele 3-7: Early Bird countdown + upgrade CTA
- Ziua 7: Final push pentru referral + membership upgrade

---

## Flow Psihologic Corect

```
ZIUA 1-2: CLARITATE
  └── Viziune + Declarație + Obiective Corp/Spirit/Relații

ZIUA 3: EXECUȚIE
  └── Business + Domino Door (weekly plan setat)

ZIUA 4: AUTOMATIZARE
  └── Warrior Routine + Vision AI + Meditație

ZIUA 5: REZILIENȚĂ
  └── Accountability + Mind Coach (transformare emoții)

ZIUA 6: CONTROL
  └── Idea List (nu lăsa ideile să distrugă execuția)

ZIUA 7: CONTINUITATE
  └── Recap + Membership + Referral final
```

---

## Pași de Implementare

1. **Actualizez Challenge.tsx** cu noile titluri și descrieri
2. **Refactor ChallengeDay.tsx** cu noul curriculum complet
3. **Creez Day1InviteFriends.tsx** cu mesaj embedded
4. **Creez Day1JoinCommunity.tsx** cu redirect Brotherhood
5. **Creez ChallengeDay6Ideas.tsx** cu explicații Eisenhower
6. **Actualizez useAffiliateLink.ts** cu funcție pentru mesaj custom
7. **Actualizez ChallengeDay7Upgrade.tsx** cu recap și mesaj final

