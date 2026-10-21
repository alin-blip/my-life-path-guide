# AGENTS.md

## Architecture decisions

- **Native mobile via Capacitor** (`capacitor.config.ts`): wraps the existing Vite/React build (`webDir: dist`) into native iOS/Android shells. Why: reuse the entire web codebase for App Store/Play Store distribution. The `server.url` points at the sandbox preview for hot-reload; replace with the production URL (or remove) before release builds. Capacitor packages must never affect the browser/deployed web runtime — guard any native-only API usage behind `Capacitor.isNativePlatform()`.
