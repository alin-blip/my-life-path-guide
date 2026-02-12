

# Plan: Imbunatatire Engagement - Postari Seed pentru Lectii si Comunitate

## Obiectiv

Popularea discutiilor din Personal Power Plus (Zilele 1-20, 26-30) cu postari seed de la cele 6 persoane fictive existente (Andrei, Elena, Marius, Ana, Cristian, Oana), similar cu ce exista deja pentru Challenge. Postarea seed apare atat in lectia respectiva cat si pe wall-ul global al comunitatii.

## Situatia actuala

- **Challenge** (7 zile): are cate 2 postari seed per zi = 14 postari totale de la persoane fictive
- **Personal Power** (25 zile implementate): are doar 2 postari reale (breakthrough-uri), zero postari seed
- **Comunitate**: categorii existente - General, Challenge, Wins, Support, Breakthrough

## Ce se va implementa

### 1. Fisier nou de date: `src/data/personalPowerSeedPosts.ts`

Postari seed pentru fiecare zi implementata din Personal Power (zilele 1-20 si 26-30 = 25 zile). Fiecare zi va avea 2 postari de la persoane diferite, rotite intre cele 6 persona existente.

Exemplu format:
```
Ziua 1 - "Cheia Puterii Personale"
- Andrei: "Puterea personala = abilitatea de a actiona. Simplu si puternic. Am realizat ca tot ce lipsea era decizia. Ce decizie ati luat azi?"
- Elena: "Citatul cu 'Cere mai mult de la tine' m-a lovit. Azi am decis: nu mai astept conditii perfecte. Scor energie: 7/10"
```

Total: ~50 postari seed (25 zile x 2 postari).

### 2. Migrare baza de date: Insert seed posts

Script SQL care insereaza cele ~50 postari in tabelul `wall_posts` cu:
- `user_id` = UUID-urile persoanelor fictive existente
- `source_context` = `personal-power-day-X`
- `source_label` = `Personal Power Plus - Day X: [titlu]`
- `category` = `general` (pentru vizibilitate pe wall-ul comunitatii)
- `created_at` = date distribuite natural (cu cateva ore diferenta)

### 3. Categorie noua in filtru: "Courses" / "Cursuri"

Adaugare in `SkoolCategoryFilter.tsx` a unei categorii noi care grupeaza postari din toate cursurile:
```
{ id: 'courses', label: 'Courses', labelRo: 'Cursuri', icon: '📖' }
```

Postarea din Personal Power va folosi `category: 'courses'` in loc de `'general'` pentru a le putea filtra separat.

### 4. Welcome Post generic pentru Personal Power

`LessonWelcomePost.tsx` va afisa un mesaj motivational generic cu:
- Titlul lectiei si numarul zilei
- CTA: "Share your insights and breakthroughs below!"
- Stil vizual consistent (amber/orange)

Aceasta parte este deja implementata din planul anterior.

## Detalii tehnice

### Fisiere noi
- `src/data/personalPowerSeedPosts.ts` - array cu postari seed per zi

### Fisiere modificate
- `src/components/programs/SkoolCategoryFilter.tsx` - categorie noua "Courses"
- `src/pages/PersonalPowerDay.tsx` - `postCategory` schimbat de la `'general'` la `'courses'`

### Migrare SQL
- INSERT in `wall_posts` pentru ~50 postari seed
- Foloseste user_id-urile fictive existente (a1b2c3d4-1111... pana la a1b2c3d4-6666...)

### Personaje si stilul lor
1. **Andrei Popescu** (a1b2c3d4-1111) - antreprenor analitic, focusat pe date si metrici
2. **Elena Mihai** (a1b2c3d4-2222) - empatic, self-care, echilibru
3. **Marius Ionescu** (a1b2c3d4-3333) - pragmatic, orientat pe rezultate, concis
4. **Ana Vasilescu** (a1b2c3d4-4444) - creativa, storytelling, emotionala
5. **Cristian Stancu** (a1b2c3d4-5555) - strategic, business-focused
6. **Oana Dinu** (a1b2c3d4-6666) - artista, vizuala, expresiva

Postarea fiecarui personaj va reflecta stilul sau si va face referire la continutul specific al lectiei respective (exercitii, citate, concepte cheie).

