
# Plan: Sistem de Invitații Contextuale pe Toate Zilele Challenge-ului

## Rezumat
Creăm un component reutilizabil `ChallengeInviteFriends.tsx` care apare pe TOATE cele 7 zile cu mesaje contextuale diferite pentru fiecare zi, explicând ce s-a întâmplat și ce urmează.

---

## Structura Mesajelor pe Zile

### ZIUA 1 - Încep Challenge-ul
```
RO:
"Tocmai am început acest challenge și am o invitație exclusivă gratuită pentru tine.

Uite ce se întâmplă în următoarele 7 zile:
• Ziua 1: Viziune & Claritate
• Ziua 2: Corp, Spirit & Relații  
• Ziua 3: Business & Execuție
• Ziua 4: Rutina Zilnică de Execuție
• Ziua 5: Accountability & Mindset
• Ziua 6: Gândire Strategică & Idei
• Ziua 7: Continuitate & Creștere

Vrei să faci acest challenge împreună cu mine?

Alătură-te aici 👇
{REFERRAL_LINK}"
```

### ZIUA 2 - Am finalizat prima zi
```
RO:
"Hei! Am început challenge-ul și sunt în Ziua 2! 💪

Ieri (Ziua 1) mi-am setat:
✅ Viziunea pentru 2026 în toate cele 4 zone
✅ Declarația personală Napoleon Hill
✅ M-am alăturat comunității

Astăzi lucrez la obiective pentru Corp, Spirit și Relații.

Următoarele zile:
• Ziua 3: Business + Sistem Execuție
• Ziua 4: Rutină Zilnică + Meditație AI
• Ziua 5-7: Accountability + Control + Continuitate

Am o invitație exclusivă gratuită pentru tine!

Alătură-te aici 👇
{REFERRAL_LINK}"
```

### ZIUA 3 - Corp/Spirit/Relații complete
```
RO:
"Sunt în Ziua 3 din Challenge! 🎯

Ce am realizat până acum:
✅ Viziune clară pentru 2026
✅ Obiective Corp, Spirit & Relații (an/90 zile/30 zile)

Astăzi e ziua magică - setez Business + Domino Door:
→ Viziune business 1 an
→ Ținte 90 zile
→ Milestone prima lună
→ Plan săptămânal cu 4 chei

Urmează Warrior Routine, Mind Coach, și Control Idei.

Am invitație gratuită exclusivă pentru tine!

Alătură-te aici 👇
{REFERRAL_LINK}"
```

### ZIUA 4 - Business + Domino Door complete
```
RO:
"Ziua 4 în Challenge! ⚡

Am realizat deja:
✅ Viziune 2026 completă
✅ Obiective toate ariile (an/90/30 zile)
✅ Business Plan + Domino Door săptămânal

Astăzi configurez:
→ Vision Board AI (imagini pentru obiective)
→ Warrior Routine (rutină zilnică)
→ Meditație personalizată pe obiectivele MELE

Mai am 3 zile: Accountability, Control Idei, Continuitate.

Vrei să te alături? Am invitație exclusivă!

Alătură-te aici 👇
{REFERRAL_LINK}"
```

### ZIUA 5 - Rutină configurată
```
RO:
"Ziua 5 - Accountability & Mind Coach! 🧠

Ce am până acum:
✅ Viziune + Plan complet (an/90/30/săptămână)
✅ Warrior Routine configurată
✅ Vision Board AI + Meditație personalizată

Astăzi lucrez la:
→ Accountability Coach (știe tot ce am de făcut)
→ Mind Coach (transformă frici/anxietăți în putere)

Mai am 2 zile: Control Idei + Finalizare.

Încă am invitații exclusive gratuite!

Alătură-te aici 👇
{REFERRAL_LINK}"
```

### ZIUA 6 - Accountability complete
```
RO:
"Ziua 6 - Control Mental! 💡

Am realizat:
✅ Viziune + Plan complet
✅ Rutină zilnică funcțională
✅ Accountability + Mind Coach setup

Astăzi învăț să controlez impulsul ideilor noi:
→ Idea List (Parking Lot pentru idei)
→ Matricea Eisenhower
→ Să nu las ideile să distrugă execuția

Mâine finalizez și fac recap complet!

Ultimele invitații exclusive gratuite!

Alătură-te aici 👇
{REFERRAL_LINK}"
```

### ZIUA 7 - Challenge complet (mesajul final)
```
RO:
"Tocmai am terminat acest challenge! 🏆

În 7 zile am obținut mai multă claritate decât în ani.

Acum am:
✅ Viziune clară pentru 2026
✅ Plan anual + 90 zile + 30 zile
✅ Sistem execuție săptămânală (Domino Door)
✅ Rutină zilnică automatizată
✅ Control asupra ideilor

Am o invitație exclusivă gratuită pentru tine.

Alătură-te aici 👇
{REFERRAL_LINK}"
```

---

## Fișiere de Modificat/Creat

| Fișier | Acțiune |
|--------|---------|
| `src/components/challenge/ChallengeInviteFriends.tsx` | **NOU** - Component reutilizabil cu mesaje contextuale per zi |
| `src/pages/ChallengeDay.tsx` | Adaug componenta pe toate zilele (1-6) |
| `src/components/challenge/ChallengeDay7Complete.tsx` | Folosesc componenta și pentru ziua 7 (sau păstrez mesajul existent) |
| `src/components/challenge/day1/Day1InviteFriends.tsx` | **ȘTERS** sau păstrat pentru backward compatibility |

---

## Detalii Tehnice

### 1. Component Nou: ChallengeInviteFriends.tsx

```typescript
interface ChallengeInviteFriendsProps {
  dayNumber: number;  // 1-7
}

export const ChallengeInviteFriends: React.FC<ChallengeInviteFriendsProps> = ({ dayNumber }) => {
  const { language } = useLanguage();
  const { referralLink, shareWithMessage, isLoading } = useAffiliateLink();
  const [copied, setCopied] = useState(false);

  // Generează mesajul contextual bazat pe ziua curentă
  const getInviteMessage = (day: number): string => {
    // Switch pentru fiecare zi cu mesaj specific
    switch(day) {
      case 1: return generateDay1Message();
      case 2: return generateDay2Message();
      // ... etc
    }
  };

  const inviteMessage = getInviteMessage(dayNumber);
  
  // ... rest of component (Share button, Copy button, preview)
};
```

### 2. Integrare în ChallengeDay.tsx

Pentru zilele 2-6, adăugăm componenta înainte de secțiunea de comentarii:

```tsx
{/* Invite Friends Section - Apare pe toate zilele */}
{isAuthenticated && dayNumber >= 1 && dayNumber <= 6 && (
  <div className="mb-6">
    <ChallengeInviteFriends dayNumber={dayNumber} />
  </div>
)}

{/* Comments Section */}
<div className="mb-6">
  <ChallengeComments dayNumber={dayNumber} />
</div>
```

### 3. Ziua 1 - Integrare în Flow-ul Special

Pentru Ziua 1 care are flow special (Day1InviteFriends.tsx existent), putem:
- **Opțiunea A**: Înlocuim `Day1InviteFriends.tsx` cu noul component
- **Opțiunea B**: Folosim noul component doar pentru zilele 2-7 și păstrăm cel existent pentru ziua 1

Recomand **Opțiunea A** pentru consistență.

### 4. Design Component

```text
┌─────────────────────────────────────────────────────────────────┐
│  🎁 INVITĂ 1-3 PRIETENI                                        │
│                                                                 │
│  [Icon] Ai invitații exclusive gratuite. Împarte experiența   │
│         cu prietenii care vor să se transforme.                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📝 Mesajul care va fi trimis:                              ││
│  │                                                             ││
│  │  "Hei! Sunt în Ziua X din Challenge!                       ││
│  │   Ce am realizat: ...                                       ││
│  │   Ce fac astăzi: ...                                        ││
│  │   Ce urmează: ...                                           ││
│  │   Am invitație gratuită pentru tine!                        ││
│  │   {REFERRAL_LINK}"                                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  [🚀 Share / Trimite]  [📋 Copiază]                            │
│                                                                 │
│  👥 Prietenii primesc acces gratuit la Zilele 1-2              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Pași de Implementare

1. **Creez `ChallengeInviteFriends.tsx`**
   - Component cu props `dayNumber`
   - Funcție pentru generare mesaj contextual per zi
   - UI identic cu Day1InviteFriends dar mesaj dinamic

2. **Actualizez `ChallengeDay.tsx`**
   - Import noul component
   - Adaug render înainte de Comments pentru zilele 2-6
   - Pentru Ziua 1, integrez în flow-ul special existent

3. **Actualizez Ziua 7**
   - Înlocuiesc secțiunea de referral din `ChallengeDay7Upgrade.tsx` cu noul component
   - Sau las ambele (mesajul existent e bun pentru Ziua 7)

4. **Șterg/Refactor Day1InviteFriends.tsx**
   - Migrăm la noul component unificat
   - Actualizez `src/components/challenge/day1/index.ts`

---

## Beneficii

- **Mesaje contextuale**: Fiecare zi are poveste specifică
- **Social proof**: Arată progresul real al utilizatorului
- **Urgență crescătoare**: "Ultimele invitații" pe zilele finale
- **Consistență UI**: Același design pe toate zilele
- **Cod reutilizabil**: Un singur component pentru toate zilele
