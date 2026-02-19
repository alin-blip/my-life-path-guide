
# Adaugare Introducere Personala in Challenge Intake Modal

## Ce adaugam

Doua campuri noi inainte de cele 3 intrebari existente, pentru ca comunitatea sa stie cine esti:

1. **Numele tau** (Input text) - pre-populat din `leaderboard_profiles.display_name` daca exista
2. **Cu ce te ocupi?** (Input text) - domeniu/profesie/pasiune

## Schimbari

### 1. Migrare DB - Coloana noua pe `challenge_intake`

Adaugam coloana `occupation` (text, nullable) pe tabelul existent:

```sql
ALTER TABLE public.challenge_intake ADD COLUMN IF NOT EXISTS occupation text;
```

Nu adaugam `display_name` ca coloana separata - il actualizam direct pe `leaderboard_profiles` daca user-ul il modifica.

### 2. ChallengeIntakeModal.tsx - Campuri noi

- Adaugam 2 campuri noi la inceputul formularului (inainte de cele 3 intrebari existente):
  - **Numele tau** - Input text, pre-populat din `leaderboard_profiles.display_name`
  - **Cu ce te ocupi?** - Input text (ex: "Antreprenor in e-commerce", "Coach de fitness")
- La submit:
  - Update `leaderboard_profiles.display_name` daca user-ul l-a modificat
  - Salvam `occupation` in `challenge_intake`
- Postarea automata in comunitate include si noile informatii:

```
Salut, sunt [Nume]! [Ocupatie]
Tocmai am inceput Have It All Challenge!

Cel mai mare blocaj al meu: [raspuns]
Victoria mea in 30 de zile: [raspuns]
Commitment: [Da/Voi incerca/Explorez]

Cine ma tine de raspundere?
```

- Descrierea modalului se actualizeaza: "Prezinta-te comunitatii si seteaza-ti directia" (5 intrebari rapide)
- Numerotarea se actualizeaza (1-5 in loc de 1-3)

### 3. Fisiere modificate

| Fisier | Modificare |
|---|---|
| Migrare SQL | `ALTER TABLE challenge_intake ADD COLUMN occupation text` |
| `src/components/challenge/ChallengeIntakeModal.tsx` | Adaugare campuri Nume + Ocupatie, update logica submit si post comunitate |
