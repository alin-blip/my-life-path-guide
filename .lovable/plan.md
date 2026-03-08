

# Plan: Fix Corrupted Config Files

## Problem
Two critical config files were corrupted during GitHub edits:

1. **`tsconfig.json`** — entire content is on a single line with literal `\n` characters instead of actual newlines, making TypeScript unable to parse it
2. **`package.json`** — was replaced with a stub containing only 3 entries, `"react-beautiful-dnd": false` (invalid — must be a string), and `// Other dependencies...` (comments are invalid in JSON)

## Fix

### 1. Restore `tsconfig.json`
Rewrite with proper JSON formatting (same content, just properly formatted):
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "strictNullChecks": true
  }
}
```

### 2. Restore `package.json`
Rebuild from the `bun.lock` file which contains the complete, correct dependency list. All 40+ dependencies and 12+ devDependencies will be restored with correct versions. Key fixes:
- Remove `"react-beautiful-dnd": false` → restore as `"react-beautiful-dnd": "^13.1.1"`
- Remove invalid comment `// Other dependencies...`
- Restore all missing dependencies (react, react-dom, supabase, recharts, framer-motion, etc.)
- Restore all devDependencies (vite, typescript, tailwindcss, etc.)
- Restore `scripts` section (`dev`, `build`, `preview`, `lint`)

## Impact
- Build will succeed again immediately
- No functionality changes — just restoring the correct config that was corrupted

