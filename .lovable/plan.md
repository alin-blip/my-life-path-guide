
# Challenge Intake Modal - Engagement la intrarea in Challenge

## Conceptul

Cand un utilizator autentificat ajunge pe `/challenge` pentru PRIMA data (nu are inca raspunsuri salvate), apare un modal de "intake" cu 3 intrebari rapide. Raspunsurile sunt salvate in baza de date si optional postate automat ca prezentare in feed-ul comunitatii.

## Fluxul utilizatorului

```text
Utilizator ajunge pe /challenge
    |
    v
Are deja intake completat? (localStorage + DB check)
    |
    +-- DA --> Afiseaza pagina normal
    |
    +-- NU --> Modal apare cu 3 intrebari:
                1. "Unde simti cel mai mare blocaj acum?" (textarea)
                2. "Ce ar insemna o victorie reala in urmatoarele 30 de zile?" (textarea)
                3. "Esti dispus/a sa aplici zilnic 7 zile si sa postezi progresul?" (radio: Da/Nu/Voi incerca)
                    |
                    v
                Submit --> Salvare in DB + Post automat in feed comunitate
                    |
                    v
                Mesaj de confirmare + Close modal --> Pagina Challenge normala
```

## Ce se construieste

### 1. Tabel nou: `challenge_intake` (migrare SQL)

| Coloana | Tip | Descriere |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | Referinta utilizator |
| biggest_block | text | Raspuns intrebarea 1 |
| win_30_days | text | Raspuns intrebarea 2 |
| commitment_level | text | "yes" / "no" / "will_try" |
| posted_to_community | boolean | Daca a fost postat in feed |
| created_at | timestamptz | Default now() |

RLS: utilizatorul poate INSERT si SELECT doar propriile randuri.

### 2. Componenta `ChallengeIntakeModal.tsx`

- Modal fullscreen pe mobil, centrat pe desktop
- Design consistent cu stilul Challenge (gradient purple/blue)
- 3 pasi intr-un singur ecran (scroll):
  - Textarea pentru blocaj (placeholder: "Ex: Am idei dar nu le execut...")
  - Textarea pentru victorie 30 zile (placeholder: "Ex: Sa lansez primul modul al cursului...")
  - Radio group: "Da, sunt all-in!" / "Voi incerca!" / "Doar explorez"
- Buton "Incepe Transformarea" care salveaza + posteaza

### 3. Post automat in comunitate

Dupa salvare, se creeaza automat o postare in feed-ul comunitatii principale (tribe_id hardcodat) cu formatul:

```
Tocmai am inceput Have It All Challenge!

Cel mai mare blocaj al meu: [raspuns]
Victoria mea in 30 de zile: [raspuns]
Commitment: [Da/Voi incerca/Explorez]

Cine ma tine de raspundere? 🔥
```

Aceasta creeaza engagement natural - alti membri pot comenta si incuraja.

### 4. Integrare in `Challenge.tsx`

- Verificam la mount daca user-ul are deja intake completat (query DB + localStorage cache)
- Daca NU, afisam `ChallengeIntakeModal`
- Dupa completare, setam flag in localStorage si continuam normal

## Fisiere modificate

| Fisier | Modificare |
|---|---|
| Migrare SQL | Creare tabel `challenge_intake` cu RLS |
| `src/components/challenge/ChallengeIntakeModal.tsx` | NOU - Componenta modal cu cele 3 intrebari |
| `src/pages/Challenge.tsx` | Import + logica de afisare conditionata a modalului |

## Detalii tehnice

### ChallengeIntakeModal.tsx

- Foloseste `Dialog` din radix (deja instalat) pentru modal
- Textarea din `@/components/ui/textarea`
- RadioGroup din `@/components/ui/radio-group`
- La submit:
  1. INSERT in `challenge_intake`
  2. INSERT in `tribe_posts` (feed comunitate) cu continutul formatat
  3. `localStorage.setItem('challenge_intake_done', 'true')`
  4. Close modal

### Challenge.tsx - Logica de afisare

```
const [showIntake, setShowIntake] = useState(false);

useEffect(() => {
  if (!isAuthenticated) return;
  const done = localStorage.getItem('challenge_intake_done');
  if (done) return;
  // Check DB
  supabase.from('challenge_intake').select('id').eq('user_id', user.id).single()
    .then(({ data }) => {
      if (!data) setShowIntake(true);
      else localStorage.setItem('challenge_intake_done', 'true');
    });
}, [isAuthenticated]);
```

### Bilingv (RO/EN)

Toate textele vor fi conditionate de `language`:
- RO: "Unde simti cel mai mare blocaj acum?"
- EN: "Where do you feel the biggest block right now?"
