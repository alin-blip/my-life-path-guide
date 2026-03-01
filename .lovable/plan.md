

# Plan: Blog & Training Section cu SEO din Transcriptul Video

## Ce se creaza

O sectiune publica de **Blog/Training** accesibila fara autentificare, optimizata SEO, cu primul articol generat din transcriptul video-ului inregistrat.

---

## 1. Pagina Blog Index (`/blog`)

Pagina publica cu lista de articole/traininguri. Design clean, light theme (ca landing page-ul).

- Grid de carduri cu articole (thumbnail, titlu, excerpt, data, categorie)
- Filtrare pe categorii: Training, Mindset, Business, Relationships
- SEO complet: meta title, description, canonical, structured data (BlogPosting schema)
- Link in footer (deja exista `/blog` in NewFooter.tsx)

## 2. Pagina Articol Individual (`/blog/:slug`)

Pagina dedicata pentru fiecare articol, cu:

- Hero section cu titlu, autor (Alin Florin Radu), data publicarii
- Video embed placeholder (link catre YouTube)
- Continut structurat extras din transcript, rescris ca articol:
  - **Sectiune 1**: Problema antreprenorului - lista nesfarsite, lipsa viziunii
  - **Sectiune 2**: Sistemul Napoleon Hill - viziune, dorinta, credinta, autosugestie
  - **Sectiune 3**: Rutina Razboiucului - AI Mind Coach, recunostinta, respiratie, meditatie
  - **Sectiune 4**: CORE 4 - Corp, Relatii, Spiritualitate, Business
  - **Sectiune 5**: Domino Door - planificare saptamanala, matrice Eisenhower
  - **Sectiune 6**: CTA final
- Table of Contents sidebar (sticky)
- CTA inline dupa fiecare sectiune ("Incearca CEO Mind OS gratuit 5 zile")
- Author bio card
- Related articles
- SEO: JSON-LD BlogPosting, Open Graph, Twitter Cards

## 3. Date articole (hardcoded initial)

Primul articol este creat din transcript, cu slug-ul:
- **Slug**: `rutina-razbonicului-ceo-mind-os`
- **Titlu RO**: "Rutina Razboiucului: Cum sa-ti Incepi Ziua ca un CEO cu Rezultate"
- **Titlu EN**: "The Warrior Routine: How to Start Your Day as a CEO with Results"
- **Categorii**: Training, Mindset

Datele articolelor vor fi intr-un fisier static `src/data/blogPosts.ts` (fara DB, scalabil ulterior).

## 4. SEO & Geo Optimization

- Meta tags dinamice per articol (Helmet)
- JSON-LD structured data (Article, BreadcrumbList, Organization)
- Open Graph + Twitter Card meta
- Canonical URLs
- Sitemap-friendly slugs
- hreflang tags RO/EN
- Schema markup cu author, datePublished, publisher

---

## Fisiere noi

| Fisier | Descriere |
|--------|-----------|
| `src/pages/Blog.tsx` | Pagina index blog |
| `src/pages/BlogPost.tsx` | Pagina articol individual |
| `src/data/blogPosts.ts` | Date articole (primul din transcript) |
| `src/components/blog/BlogCard.tsx` | Card articol pentru grid |
| `src/components/blog/BlogArticle.tsx` | Layout articol complet |
| `src/components/blog/BlogSEO.tsx` | Componenta SEO (JSON-LD, OG, meta) |

## Fisiere modificate

| Fisier | Modificare |
|--------|-----------|
| `src/App.tsx` | Adauga rute `/blog` si `/blog/:slug` (publice, fara ProtectedRoute) |

---

## Continutul primului articol (extras din transcript)

Transcriptul va fi restructurat in 6 sectiuni principale:

1. **Problema**: Antreprenorii ajung la birou fara directie, cu liste nesfarsite de task-uri
2. **Viziunea (Napoleon Hill)**: Scop definit, dorinta, credinta, autosugestie - cei 6 pasi
3. **Rutina Razboiucului**: Mind Coach AI, recunostinta, declaratie de viziune, respiratie, meditatie ghidata
4. **Cele 4 Arii (CORE 4)**: Corp (antrenament, nutritie), Relatii (valoare zilnica), Spiritualitate (meditatie, journaling), Business (content, task-uri)
5. **Domino Door**: Planificare saptamanala, task prioritar (Dominator), matrice Eisenhower, AI planning
6. **CTA**: "Daca nu ai un sistem, nu operezi la capacitate maxima"

---

## Design

- Light theme (consistent cu landing page)
- Font mare, readability-first
- Gradient subtle pe hero
- Sticky ToC pe desktop
- Mobile responsive
- CTA buttons dupa fiecare sectiune majora

