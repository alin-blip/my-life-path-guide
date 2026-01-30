
# Plan: Corectare Sistem Referral - Link Corect + Afișare pe Ziua 1

## Probleme Identificate

### 1. Link-ul de Referral Incorect
- **Acum**: `${window.location.origin}/?ref=${userId}` → rezultă `https://lovable.app/?ref=...`
- **Trebuie**: `https://warriorsos.com/challenge-landing?ref=${userId}`

### 2. Ziua 1 - Componenta Invite Friends nu Apare
- Ziua 1 are un `return` separat (linia 725) care NU include `ChallengeInviteFriends`
- Componenta e render-uită doar pentru zilele 2-7 (în blocul return de la linia 728)

---

## Modificări Necesare

### 1. Fișier: `src/hooks/useAffiliateLink.ts`

**Modificare linia 18-20:**

| Vechi | Nou |
|-------|-----|
| `const baseUrl = window.location.origin;` | `const baseUrl = 'https://warriorsos.com';` |
| `setReferralLink(\`${baseUrl}/?ref=${session.user.id}\`);` | `setReferralLink(\`${baseUrl}/challenge-landing?ref=${session.user.id}\`);` |

Rezultat:
- Link-ul va fi: `https://warriorsos.com/challenge-landing?ref=USER_ID`
- Funcționează atât în preview cât și în producție

### 2. Fișier: `src/pages/ChallengeDay.tsx`

**Adăugare în blocul return pentru Ziua 1 (înainte de linia 720):**

Trebuie adăugat `ChallengeInviteFriends` în structura Zilei 1, înainte de secțiunea de comentarii.

Poziție: între sfârșitul flow-ului Day1 (linia ~716-719) și `ChallengeComments` (linia 720-722)

---

## Detalii Tehnice

### useAffiliateLink.ts - Cod Actualizat

```typescript
useEffect(() => {
  const getUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
      
      // Generate the referral link - ALWAYS use production domain
      const baseUrl = 'https://warriorsos.com';
      setReferralLink(`${baseUrl}/challenge-landing?ref=${session.user.id}`);
    }
  };

  getUser();
}, []);
```

### ChallengeDay.tsx - Ziua 1 Return Block

```tsx
{/* Ziua 1 - După flow-ul principal, înainte de Comments */}

{/* Invite Friends Section - Ziua 1 */}
{isAuthenticated && (
  <div className="mt-6 mb-6">
    <ChallengeInviteFriends dayNumber={1} />
  </div>
)}

{/* Comments Section - ALWAYS visible */}
<div className="mt-6">
  <ChallengeComments ref={commentsRef} dayNumber={1} />
</div>
```

---

## Verificare Finală - Toate Zilele

| Zi | Afișare ChallengeInviteFriends | Link Corect |
|----|-------------------------------|-------------|
| 1 | ✅ (după adăugare în return Ziua 1) | ✅ warriorsos.com/challenge-landing?ref=... |
| 2 | ✅ (deja în return general) | ✅ warriorsos.com/challenge-landing?ref=... |
| 3 | ✅ (deja în return general) | ✅ warriorsos.com/challenge-landing?ref=... |
| 4 | ✅ (deja în return general) | ✅ warriorsos.com/challenge-landing?ref=... |
| 5 | ✅ (deja în return general) | ✅ warriorsos.com/challenge-landing?ref=... |
| 6 | ✅ (deja în return general) | ✅ warriorsos.com/challenge-landing?ref=... |
| 7 | ✅ (în ChallengeDay7Complete) | ✅ warriorsos.com/challenge-landing?ref=... |

---

## Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| `src/hooks/useAffiliateLink.ts` | Schimb `window.location.origin` cu `https://warriorsos.com` și path-ul în `/challenge-landing` |
| `src/pages/ChallengeDay.tsx` | Adaug `ChallengeInviteFriends` în blocul return pentru Ziua 1 |

---

## Rezultat Așteptat

După implementare:
1. **Toate zilele** vor afișa secțiunea "Invită 1-3 Prieteni"
2. **Link-ul de referral** va fi întotdeauna `https://warriorsos.com/challenge-landing?ref=USER_ID`
3. **Mesajul** va fi contextual pentru fiecare zi (cum e deja implementat)
4. Prietenii care dau click pe link ajung pe `/challenge-landing` cu parametrul `ref` setat
