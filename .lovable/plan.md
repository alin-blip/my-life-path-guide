
# Optimizare Performanta si Bundle Size

## Problema curenta
Build-ul principal este foarte mare (~5000+ module). Desi lazy loading este deja implementat pentru ~80 de pagini, exista cateva probleme majore:

- **Dashboard.tsx** (905 linii) este incarcat eager - aduce multe dependente in bundle-ul principal
- **Index.tsx** incarca eager ~8 componente landing mari
- **Recharts** (folosit in 9+ fisiere) nu este izolat - se poate scurge in bundle principal
- **Fabric.js** (librarie canvas grea) nu are chunk splitting dedicat
- **Framer Motion** este importat in multe componente fara dynamic import
- Lipsesc configurari de chunk splitting in `vite.config.ts`

## Plan de implementare

### Pas 1: Chunk splitting manual in Vite config
Adaugam `build.rollupOptions.output.manualChunks` in `vite.config.ts` pentru a separa librariile grele in chunk-uri dedicate:
- `vendor-react` - react, react-dom, react-router-dom
- `vendor-ui` - radix-ui, shadcn components
- `vendor-charts` - recharts
- `vendor-canvas` - fabric
- `vendor-motion` - framer-motion
- `vendor-query` - tanstack/react-query
- `vendor-supabase` - supabase-js
- `vendor-date` - date-fns

### Pas 2: Lazy load Index landing components
Transformam componentele landing din Index.tsx in dynamic imports:
- `StickyHeader`, `NewHeroSection` raman eager (above the fold)
- `FeatureShowcase`, `InteractiveTimeline`, `TestimonialCarousel`, `PricingComparison`, `FAQSection`, `NewFooter` devin lazy

### Pas 3: Lazy load Dashboard sub-componente grele
In `Dashboard.tsx`, componentele care nu sunt vizibile imediat vor fi lazy loaded:
- `LearnDashboard`, `WeeklyProgress`, `MonthlyObjectives` etc.
- Celebrarile (`TransformedWarrior`, `MediaMaster`, etc.)

### Pas 4: Lazy load Layout sub-componente
In `Layout.tsx`:
- `AccountabilityCoachWidget` - lazy load (widget flotant, nu e critic la start)
- `GoalRemindersNotification` - lazy load

## Detalii tehnice

### Vite Config - Manual Chunks
```text
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-ui': [...radix packages],
  'vendor-charts': ['recharts'],
  'vendor-canvas': ['fabric'],
  'vendor-motion': ['framer-motion'],
  'vendor-query': ['@tanstack/react-query'],
  'vendor-supabase': ['@supabase/supabase-js'],
  'vendor-date': ['date-fns'],
}
```

### Fisiere modificate
1. `vite.config.ts` - adaugare manualChunks
2. `src/pages/Index.tsx` - lazy load componente below-the-fold
3. `src/components/Dashboard.tsx` - lazy load sub-componente grele
4. `src/components/Layout.tsx` - lazy load widget-uri non-critice

### Impact estimat
- Bundle-ul principal va fi redus semnificativ (estimare: -40-60%)
- Incarcarea initiala va fi mult mai rapida
- Librariile grele (recharts ~200KB, fabric ~300KB, framer-motion ~100KB) vor fi incarcate doar cand sunt necesare
- Experienta utilizatorului pe prima incarcare va fi imbunatatita considerabil
