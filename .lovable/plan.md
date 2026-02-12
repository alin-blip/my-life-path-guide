
# Adaugare Comunitate Embedded in Pagina /challenge

## Ce adaugam

Pe pagina principala `/challenge` (overview-ul cu cele 7 zile), adaugam o sectiune noua dupa gridul de zile care include:

1. **CommunityWelcomeBanner** -- mesajul de bun venit fixat de admin (cel care apare deja pe wall-ul comunitatii)
2. **Un Write Post** simplu + feed de postari din comunitate -- folosind componenta `LessonCommunityPost` cu `dayNumber=0` si titlul "Introducere / Welcome", pentru ca utilizatorii sa poata posta direct din challenge fara sa navigheze la Community

Astfel, utilizatorii care parcurg challenge-ul pot:
- Vedea mesajul de bun venit cu regulile si link-urile
- Se prezenta si interactiona direct din pagina challenge-ului
- Vedea postarile celorlalti participanti

## Fisier modificat

### `src/pages/Challenge.tsx`

Adaugam dupa gridul de zile (linia ~378, dupa `</div>` care inchide `space-y-4`) si inainte de CTA-ul final:

1. Import `CommunityWelcomeBanner` din `@/components/programs/CommunityWelcomeBanner`
2. Import `LessonCommunityPost` (deja importat pe linia 19)
3. Sectiune noua cu:
   - Header: "Comunitate / Community" cu iconita Users
   - `CommunityWelcomeBanner` -- mesajul de bun venit
   - `LessonCommunityPost` cu `dayNumber={0}`, `dayTitle="Welcome / Introducere"` -- feed-ul de postari de introducere
   - Vizibil doar pentru utilizatorii autentificati (`isAuthenticated`)

## Detalii tehnice

- `CommunityWelcomeBanner` este deja un component standalone care functioneaza independent (fetches din `community_settings`)
- `LessonCommunityPost` cu `dayNumber=0` va afisa postarile legate de introducerea challenge-ului (source context: `challenge-day-0`)
- Nu sunt necesare modificari de baza de date
- Nu sunt necesare componente noi
