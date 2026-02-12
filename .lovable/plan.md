

# Fix Link-uri Comunitate + Adaugare Postari Seed in Challenge

## Probleme Identificate

### 1. Link-uri gresite spre Comunitate
- In exercitiile din Ziua 1, link-ul "Join Community" / "Alatura-te Comunitatii" trimite la `/brotherhood?tab=tribes` -- dar ruta `/brotherhood` face redirect la `/programs?tab=community` si **pierde parametrii** (tab=tribes dispare)
- Link-ul corect ar trebui sa fie `/programs?tab=community`

### 2. Zero postari seed in challenge
- Tabela `wall_posts` nu contine **nicio postare** cu `source_context` de tip `challenge-day-X`
- Componenta `LessonCommunityPost` **exista** pe fiecare zi (Ziua 1: linia 874, Zilele 2-7: linia 1116), dar afiseaza "Nicio postare inca" pentru ca nu exista date
- Trebuie inserate postari fictive (seed) cu nume de utilizatori reali care sa apara atat in lectia respectiva cat si pe wall-ul comunitatii

### 3. Link-ul din Welcome Message
- Mesajul de bun venit din baza de date contine `https://warriorsos.com/programs?tab=community` -- acesta este URL-ul corect al domeniului custom, deci **functioneaza** pe productie. Daca nu merge, e posibil sa fie o problema de DNS/domeniu, nu de cod.

---

## Solutie

### Pas 1: Fix link exercitiu Ziua 1 (ChallengeDay.tsx)

Modificam in `challengeContent[0]` (Ziua 1):
- Linia 117: `link: "/brotherhood?tab=tribes"` -> `link: "/programs?tab=community"`  
- Linia 124: `link: "/brotherhood?tab=tribes"` -> `link: "/programs?tab=community"`

### Pas 2: Insert postari seed in `wall_posts`

Inseram postari fictive pentru fiecare zi a challenge-ului (Days 1-7) folosind aceleasi 6 persona-uri care exista deja in comentariile seed (Andrei Popescu, Elena Mihai, Marius Ionescu, Ana Vasilescu, Cristian Stancu, Oana Dinu).

Fiecare postare va avea:
- `user_id`: un UUID fictiv consistent per persona
- `content`: text relevant pentru task-ul zilei (ex: Ziua 1 = declaratie/viziune, Ziua 2 = obiective corp/spirit/relatii, etc.)
- `source_context`: `challenge-day-1`, `challenge-day-2`, ..., `challenge-day-7`
- `source_label`: `Challenge - Day X: [Titlu]`
- `category`: `challenge`
- `likes_count`: valori randomizate (2-8)
- `comments_count`: 0-2

Total: ~14-21 postari seed (2-3 per zi x 7 zile)

Exemplu Ziua 1:
- **Andrei Popescu**: "Tocmai am terminat Harta Realitatii. Scor: Corp 5/10, Spirit 4/10, Relatii 7/10, Business 6/10. Declaratia mea: Sunt un antreprenor care are totul..."
- **Elena Mihai**: "Am realizat ca burnout-ul meu vine din faptul ca am sacrificat relatiile pentru business. Declaratia mea anti-burnout..."
- **Marius Ionescu**: "Pragmatic vorbind, scorul meu la Business e 8/10 dar Corp doar 3/10. Asta e problema..."

Exemplu Ziua 3:
- **Cristian Stancu**: "Domino Door-ul meu: Milestone - Lansare produs beta. Cheie 1: Finalizare MVP..."
- **Ana Vasilescu**: "Am configurat AI Wizard-ul si am descoperit ca obiectivul meu real de business e diferit de ce credeam..."

### Pas 3: Creare profil leaderboard pentru personas (daca nu exista)

Pentru ca postarile sa apara cu nume si avatar, trebuie sa existe intrari in `leaderboard_profiles` pentru fiecare persona fictiva. Inseram 6 profile cu:
- `display_name`: Andrei Popescu, Elena Mihai, etc.
- `avatar_emoji`: emoji-uri specifice fiecaruia
- `user_id`: UUID-uri fictive consistente

---

## Detalii Tehnice

### Fisiere modificate
1. **`src/pages/ChallengeDay.tsx`** -- fix 2 link-uri (liniile 117, 124): `/brotherhood?tab=tribes` -> `/programs?tab=community`

### Migratii SQL
1. **Insert `leaderboard_profiles`** pentru 6 personas seed (daca nu exista deja)
2. **Insert `wall_posts`** -- ~18 postari seed (2-3 per zi x 7 zile) cu `source_context` corect si `category = 'challenge'`

### Ce NU se modifica
- Componentele `LessonCommunityPost` si `CommunityWelcomeBanner` functioneaza corect
- Structura paginii ChallengeDay ramane neschimbata
- Mesajul de welcome din baza de date ramane la fel

