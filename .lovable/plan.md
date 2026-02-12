

# Transformare Comunitate si Grupuri in Stil Facebook Groups

## Analiza Diferentelor: Facebook Groups vs. Implementarea Actuala

### Ce face Facebook Groups bine:

1. **Cover Photo Mare + Info Band**: Header cu cover photo full-width, avatar grup suprapus, nume grup, numar membri, buton Join/Joined, toate intr-o banda compacta
2. **Tab-uri sub header (nu sub content)**: Discussion, Members, Events, Media, Files - ca o navigatie secundara lipita de header
3. **Post Card Facebook-style**:
   - Continut complet vizibil (nu truncat cu "line-clamp")
   - Imagini full-width in card (nu thumbnail 80px)
   - Butonul "Like/Comment/Share" pe o linie separata cu text, nu doar icoane
   - Comentarii MEREU vizibile (primele 2-3), nu ascunse sub toggle
   - Input comentariu permanent sub fiecare postare cu avatar user
   - Fond comentarii usor gri (bg diferit de postare)
4. **Write Post Box**: Avatar + "What's on your mind?" input inline (nu dialog separat)
5. **Sidebar dreapta**: About, Rules, Activity - sticky
6. **Reaction counts**: "X people liked this" text, nu doar numar

## Ce Schimbam

### 1. SkoolPostCard.tsx - Transformare in Stil Facebook

**Schimbari:**
- Elimina truncarea textului (`line-clamp-2`) - afiseaza continut complet cu "See more" dupa 4 randuri
- Imagini full-width in card (nu thumbnail 80px lateral)
- Butonul Like/Comment cu TEXT nu doar icoane: "Like · Comment"
- Comentariile (primele 2) sunt MEREU vizibile, nu ascunse sub toggle
- Input-ul de comentariu e MEREU vizibil la baza cardului (cu avatar user)
- Separator vizual intre postare si comentarii (bg-muted/30)
- Adauga "View X more comments" link daca sunt mai mult de 2

**Structura vizuala noua:**
```text
+------------------------------------------+
| [Avatar] Andrei Popescu                  |
| 2 ore · Challenge                        |
|                                          |
| Continutul complet al postarii fara      |
| truncare, cu "See more" daca > 4 linii  |
|                                          |
| [========= Imagine full-width =========] |
|                                          |
| 3 likes                                 |
|------------------------------------------|
| Like      |      Comment      |  Share   |
|------------------------------------------|
| View 3 more comments                    |
|                                          |
| [av] Elena: "Super idee!" · 1h          |
| [av] Marius: "De acord" · 30m           |
|------------------------------------------|
| [av] Write a comment...          [Send]  |
+------------------------------------------+
```

### 2. SkoolWritePost.tsx - Input Inline (fara Dialog)

**Schimbari:**
- Elimina Dialog-ul modal pentru creare postare
- Click pe "Scrie ceva..." expandeaza inline textarea + butoane (emoji, media, video)
- Textarea se auto-resize
- Butonul "Posteaza" apare cand exista text
- Mai simplu, mai rapid - reduce numarul de click-uri

### 3. GroupHeader.tsx - Cover Photo Full-width + Tab-uri

**Schimbari:**
- Cover photo mai mare (h-48 in loc de h-32)
- Avatar suprapus pe cover (nu sub)
- Tab-uri (Feed, Chat, Members, About) mutate IN header, sub info band
- Elimina taburile din GroupPage.tsx body si le muta in header
- Adauga numar de membri online (ca pe Facebook)

### 4. GroupPage.tsx - Restructurare Layout

**Schimbari:**
- Layout 2 coloane pe desktop: Feed (stanga) + Sidebar (dreapta)
- Sidebar sticky cu: About, Rules, Members preview, Activity
- Tab-urile se muta in GroupHeader
- Elimina structura Tabs wrapper din body

### 5. CommunityTab.tsx - Sidebar mai Facebook-like

**Schimbari minore:**
- SkoolGroupSidebar: adauga "About this community" expandabil
- Adauga "Rules" sectiune

### 6. PostCommentCard.tsx - Stil Facebook Comentarii

**Schimbari:**
- Comentariul in "bubble" gri (rounded-2xl bg-muted) nu simplu text
- Nume bold IN bubble, continut sub
- Butoane "Like · Reply" sub bubble (nu in interiorul ei)
- Reply-urile nested cu indent mai mic (ml-10 in loc de ml-8)

## Detalii Tehnice

### Fisiere modificate:
1. `src/components/programs/SkoolPostCard.tsx` - card complet refactorizat in stil FB
2. `src/components/programs/SkoolWritePost.tsx` - inline expand in loc de Dialog
3. `src/components/programs/PostCommentCard.tsx` - comment bubble style
4. `src/components/groups/GroupHeader.tsx` - cover mare + tab-uri integrate
5. `src/pages/GroupPage.tsx` - layout 2 coloane + tab-uri mutate in header
6. `src/components/groups/GroupFeed.tsx` - minor: adaptat la noul layout

### Fisiere nemodificate:
- `useWallPostComments.ts` - logica comentarii ramane identica
- `useBrotherhood.ts` - logica postari ramane identica
- Componente de media upload, emoji, video - raman identice

## Ordinea Implementarii

| Pas | Fisier | Ce | Efort |
|-----|--------|-----|-------|
| 1 | SkoolPostCard.tsx | Card FB-style cu comentarii mereu vizibile | Mare |
| 2 | PostCommentCard.tsx | Comment bubble style | Mic |
| 3 | SkoolWritePost.tsx | Inline expand fara Dialog | Mediu |
| 4 | GroupHeader.tsx | Cover mare + tab-uri | Mediu |
| 5 | GroupPage.tsx | Layout 2 coloane | Mediu |

