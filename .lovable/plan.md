

# Cursuri Platforma in Classroom + Comision 50%

## Rezumat

In tab-ul "Classroom" al fiecarui grup, vor aparea automat 4 cursuri platforme INAINTE de cursurile custom ale coach-ului. Coach-ii primesc 50% comision din vanzarile generate prin comunitatea lor.

## Cursuri platforme

| Curs | Pret | Ruta |
|------|------|------|
| Personal Power Plus | 97 EUR | `/personal-power` |
| The Ultimate YOU | 97 EUR | `/ultimate-you` |
| Warrior Certified Coach | 1.999 EUR (sau abonament ELITE) | `/warrior-launch-accelerator` |
| Have It All Lifestyle Challenge | GRATUIT | `/challenge` |

## Ce se modifica

### 1. `src/components/coach/CoachTribeLessons.tsx`
- Adaugare array `PLATFORM_COURSES` cu cele 4 cursuri hardcoded
- Randare lor in sectiunea "Cursuri Platforma" cu badge "Platforma" si pret
- Click navigheaza la ruta cursului cu `?ref=COACH_ID` pentru tracking comision
- Coach-ii NU pot sterge/edita aceste cursuri
- Cursurile custom ale coach-ului apar sub ele cu separare vizuala clara

### 2. `src/pages/WarriorLaunchAccelerator.tsx`
- Redenumire titlu vizual din "Warrior Launch Accelerator" in "Warrior Certified Coach"
- Actualizare meta tags

### 3. Tabela noua: `platform_course_referrals` (migrare DB)
- `id` (uuid PK)
- `coach_id` (uuid) - coach-ul care a recomandat
- `user_id` (uuid) - clientul care a cumparat
- `course_slug` (text) - 'personal-power', 'ultimate-you', 'warrior-certified-coach', 'challenge'
- `commission_cents` (integer) - 50% din pret in centi
- `status` (text) - 'pending', 'paid'
- `stripe_payment_id` (text, nullable)
- `created_at` (timestamptz)
- RLS: coach-ul vede doar referral-urile proprii

### 4. Structura vizuala in Classroom

```text
+---------------------------------------------+
| Cursuri Platforma                    [Badge] |
+---------------------------------------------+
| Personal Power Plus           97 EUR    ->   |
| The Ultimate YOU              97 EUR    ->   |
| Warrior Certified Coach    1.999 EUR    ->   |
| Have It All Challenge       GRATUIT     ->   |
+---------------------------------------------+
|                                             |
| Cursurile Tale              [+ Curs Nou]    |
+---------------------------------------------+
| ... cursuri custom coach ...                |
+---------------------------------------------+
```

## Detalii tehnice

- Link-urile cursurilor platforma includ `?ref=COACH_ID` pentru tracking-ul comisionului de 50%
- Ruta `/warrior-launch-accelerator` ramane neschimbata (doar titlul vizual se schimba)
- Comisionul de 50% se aplica la TOATE cursurile platforma (inclusiv Warrior Certified Coach la 1.999 EUR)
- Tabela `platform_course_referrals` va fi folosita de webhook-ul Stripe existent pentru a inregistra comisioanele
- Challenge-ul gratuit nu genereaza comision (pret 0)

