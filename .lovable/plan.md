

# Plan: Headline Nou + "în maxim 40 de zile"

## Modificări

### Headline Complet Nou

| Limba | Text |
|-------|------|
| 🇷🇴 **RO** | **Fii de 2-10X mai productiv în maxim 40 de zile** în timp ce-ți reconstruiești **relațiile, corpul și sufletul** |
| 🇬🇧 **EN** | **Get 2-10x more done in just 40 days** while you rebuild your **marriage, body and soul** |

### Subheadline

| Limba | Text |
|-------|------|
| 🇷🇴 **RO** | Sistemul Dovedit alimentat de AI pentru productivitate, impact, fericire și sens |
| 🇬🇧 **EN** | The Proven System powered by AI for productivity, impact, happiness and meaning |

## Structura Vizuală

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              🟢 Pentru Antreprenori Ocupați                 │
│                                                             │
│     ╔═══════════════════════════════════════════════════╗   │
│     ║  Fii de 2-10X mai productiv                       ║ ← gradient
│     ║  în maxim 40 de zile                              ║ ← normal
│     ║                                                   ║   │
│     ║  în timp ce-ți reconstruiești                     ║ ← muted, smaller
│     ║  relațiile, corpul și sufletul                    ║ ← foreground
│     ╚═══════════════════════════════════════════════════╝   │
│                                                             │
│     Sistemul Dovedit alimentat de AI pentru                 │
│     productivitate, impact, fericire și sens                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Cod Tehnic

### Modificare în `NewHeroSection.tsx`

**heroContent object:**
```typescript
const heroContent = {
  badge: language === 'ro' ? 'Pentru Antreprenori Ocupați' : 'For Busy Entrepreneurs',
  headline: {
    // Linia 1 - rezultat cu gradient
    result: language === 'ro' 
      ? 'Fii de 2-10X mai productiv' 
      : 'Get 2-10x more done',
    // Linia 2 - timeframe specific
    timeframe: language === 'ro' 
      ? 'în maxim 40 de zile' 
      : 'in just 40 days',
    // Linia 3 - connector mai mic
    connector: language === 'ro' 
      ? 'în timp ce-ți reconstruiești' 
      : 'while you rebuild your',
    // Linia 4 - transformare finală
    transformation: language === 'ro' 
      ? 'relațiile, corpul și sufletul' 
      : 'marriage, body and soul'
  },
  subheadline: language === 'ro' 
    ? 'Sistemul Dovedit alimentat de AI pentru productivitate, impact, fericire și sens' 
    : 'The Proven System powered by AI for productivity, impact, happiness and meaning',
  // ... rest
};
```

**JSX pentru Headline:**
```tsx
<h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
  {/* Linia 1 - Rezultat principal cu gradient */}
  <span className="n8n-gradient-text">{heroContent.headline.result}</span>
  <br />
  {/* Linia 2 - Timeframe */}
  <span className="text-foreground">{heroContent.headline.timeframe}</span>
  <br />
  {/* Linia 3 - Connector mai mic */}
  <span className="text-muted-foreground text-xl sm:text-3xl md:text-4xl">
    {heroContent.headline.connector}
  </span>
  <br />
  {/* Linia 4 - Transformare */}
  <span className="text-foreground">{heroContent.headline.transformation}</span>
</h1>
```

## Fișier de Modificat

| Fișier | Modificare |
|--------|------------|
| `src/components/landing/NewHeroSection.tsx` | Actualizare heroContent + JSX headline |

## Beneficii

- **Promisiune specifică**: "2-10X" e mai impactant decât "Dublează"
- **Timeframe clar**: "40 de zile" e mai credibil și urgent
- **Transformare completă**: relații + corp + suflet = tot ce contează
- **Subheadline puternic**: AI + productivitate + impact + fericire + sens

