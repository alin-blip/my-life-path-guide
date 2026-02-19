
# Inlocuire "Andrei Popescu" cu "Alin F. Radu"

## Ce trebuie schimbat

### 1. Baza de date - profilul leaderboard
Profilul fictiv "Andrei Popescu" (`user_id: a1b2c3d4-1111-4000-8000-000000000001`) din tabelul `leaderboard_profiles` trebuie redenumit in "Alin F. Radu".

**Comanda SQL:**
```sql
UPDATE leaderboard_profiles 
SET display_name = 'Alin F. Radu' 
WHERE user_id = 'a1b2c3d4-1111-4000-8000-000000000001';
```

Acest update va face ca toate cele 44 de postari existente asociate acestui user sa afiseze automat "Alin F. Radu" in loc de "Andrei Popescu", atat in Community cat si in Warrior Tribe.

### 2. Fisierul seed data
In `src/data/personalPowerSeedPosts.ts`, variabila `ANDREI` va fi redenumita in `ALIN` pentru consistenta cu noul nume.

**Linia 11:**
- Inainte: `const ANDREI = 'a1b2c3d4-1111-4000-8000-000000000001';`
- Dupa: `const ALIN = 'a1b2c3d4-1111-4000-8000-000000000001';`

Toate referintele catre `ANDREI` din acest fisier (folosite la `userId` in postarile seed) vor fi inlocuite cu `ALIN`.

### Rezultat
- Toate postarile din feed-ul Community si din grupul Warrior Tribe care aratau "Andrei Popescu" vor arata "Alin F. Radu"
- Nicio alta modificare nu e necesara - numele se incarca din `leaderboard_profiles` la runtime
