

# Introducere pentru The Ultimate YOU

## Ce se va implementa

O sectiune de introducere pe pagina de overview (`UltimateYouOverview.tsx`) care va aparea INAINTE de lista celor 18 zile. Aceasta va contine:

1. **Text introductiv** complet in format Markdown — explicand ce este cursul, ce va invata utilizatorul, structura celor 18 zile, si ce sa astepte
2. **Buton "Asculta cu AI"** — folosind componenta `TextToSpeechButton` existenta pentru a citi introducerea cu voce

## Continut introductiv (bilingv RO/EN)

Textul va acoperi:
- Ce este The Ultimate YOU (program transformational de 18 zile)
- Cele 3 module: Personal Power (Zilele 1-7), Get the Edge (Zilele 8-13), Inner Strength (Zilele 14-18)
- Ce vei invata: decizii, emotii, obiective, relatii, energie, finante, scop
- Cum functioneaza: lectie + exercitii + AI Coach + breakthrough + comunitate
- Indemn de actiune: "Incepe cu Ziua 1"

## Detalii tehnice

### Fisiere modificate

**`src/pages/UltimateYouOverview.tsx`** — adaugare sectiune intro cu:
- Card expandabil/collapsibil cu introducerea completa
- `TextToSpeechButton` importat din `@/components/ui/TextToSpeechButton`
- Textul stocat ca constanta string in pagina (RO si EN)
- Render cu `ReactMarkdown` folosind aceleasi componente de styling ca `UltimateYouLesson`
- Sectiunea apare intre header si progress bar

### Componente reutilizate
- `TextToSpeechButton` — deja existent, functioneaza cu edge function-ul `text-to-speech`
- `ReactMarkdown` — deja instalat si folosit in `UltimateYouLesson`

### Structura vizuala
- Card cu background subtil (`bg-card border`)
- Buton verde "Asculta introducerea" in partea de sus
- Text Markdown formatat cu heading-uri, bullet points, bold
- Buton "Incepe Ziua 1" la final care navigheaza la `/ultimate-you/1`

### Build errors existente
Voi verifica si repara orice build errors existente in acelasi timp (din mesajele anterioare de implementare).

