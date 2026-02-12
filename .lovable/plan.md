

# Simplificare Challenge - Eliminare Comunitate Interna + Redirectionare catre Facebook Group

## Obiectiv
Eliminam toate componentele de comunitate interna din Challenge si din platforma, inlocuindu-le cu link-uri directe catre un grup Facebook. Challenge-ul ramane intact: Reality Check, WHY, Declaration, Commitment.

## Ce se elimina

### Din Challenge Overview (`src/pages/Challenge.tsx`)
- Import-urile `CommunityWelcomeBanner` si `LessonCommunityPost`
- Sectiunea "Comunitate" din pagina overview (liniile 411-427) care afisa banner + feed Day 0
- Textele cu "Join community" din subtitlu-ul Day 1

### Din Challenge Day (`src/pages/ChallengeDay.tsx`)
- Import-ul `LessonCommunityPost`
- Functia `handlePostDeclaration` care posta in `wall_posts`
- Prop-ul `onPostToComments` de pe `Day1VisionDeclaration` si `Day1DeclarationReview`
- Sectiunile `LessonCommunityPost` din Day 1 (linia 886-889) si din zilele 2-7 (liniile 1128-1131)
- Import-ul `ChallengeLiveChat` si sectiunile de live chat (liniile 882-884, 1123-1126)
- Exercitiile "Join Community" si "Invite Friends" din lista de exercitii Day 1

### Din Commitment (`src/components/challenge/day1/Day1Commitment.tsx`)
- Eliminam orice referinta la comment count / community engagement
- Pastram doar checkbox-ul de commitment

### Din Vision Declaration (`src/components/challenge/day1/Day1VisionDeclaration.tsx`)
- Eliminam prop-ul `onPostToComments` si butonul "Share to Community"
- Adaugam un buton "Share pe Facebook" care deschide link-ul grupului FB intr-un tab nou

### Din Programs/NavBar (`src/components/programs/SkoolNavBar.tsx`)
- Eliminam tab-ul "Community" din navigatie
- Default tab devine "Classroom"

### Din Programs page (`src/pages/Programs.tsx`)
- Eliminam import-ul `CommunityTab`
- Eliminam case-ul 'community' din switch
- Default tab devine 'classroom'

## Ce se adauga

### Link Facebook Group
- In `Day1Commitment.tsx`: Adaugam un buton/link "Alatura-te Grupului Facebook" cu icon Facebook
- In pagina Challenge overview: Adaugam un card simplu "Comunitatea noastra pe Facebook" cu link direct
- In `Day1VisionDeclaration.tsx`: Butonul "Share" deschide Facebook Group in loc sa posteze intern

### Constanta Facebook Group URL
- Cream un fisier `src/config/socialLinks.ts` cu URL-ul grupului Facebook ca sa fie usor de schimbat

## Fisiere modificate

| Fisier | Ce se schimba |
|--------|---------------|
| `src/pages/Challenge.tsx` | Elimina community section, adauga link FB |
| `src/pages/ChallengeDay.tsx` | Elimina LessonCommunityPost, handlePostDeclaration, live chat, exercitii community |
| `src/components/challenge/day1/Day1Commitment.tsx` | Elimina comment tracking, adauga buton FB |
| `src/components/challenge/day1/Day1VisionDeclaration.tsx` | Inlocuieste "Share to Community" cu "Share pe FB" |
| `src/pages/Programs.tsx` | Elimina tab community, default classroom |
| `src/components/programs/SkoolNavBar.tsx` | Elimina tab community |

### Fisier nou
| Fisier | Ce contine |
|--------|------------|
| `src/config/socialLinks.ts` | `FACEBOOK_GROUP_URL` constant |

## Ce NU se sterge (raman in codebase dar nu se mai folosesc activ)
- Componentele `SkoolPostCard`, `PostCommentCard`, `CommunityTab`, `GroupFeed` etc. raman in codebase - nu le stergem acum pentru ca nu afecteaza nimic si pot fi utile mai tarziu
- Tabelele `wall_posts`, `wall_post_likes`, `wall_post_comments` raman in baza de date

## Flow Final Day 1

```text
Pas 0: Reality Check (8 slidere) - 3 min
Pas 1: WHY Questions (5 intrebari) - 5 min  
Pas 2: Vision Declaration - 3 min
  -> Buton optional "Distribuie in Grupul Facebook"
Pas 3: Commitment (checkbox) - 10 sec
  -> Buton optional "Intra in Grupul Facebook"
  -> Buton optional "Invita prieteni"
DONE -> Navigate to Day 2
```

