# AGENTS.md

## Architecture decisions

- **Native mobile via Capacitor** (`capacitor.config.ts`): bundle the existing Vite/React build into native shells without a remote `server` override. Why: production releases must run packaged assets, not a sandbox or hot-reload website. Capacitor packages must never affect the browser/deployed web runtime — guard any native-only API usage behind `Capacitor.isNativePlatform()`.
- **iOS release preparation**: keep the generated iOS project in source control and validate the production Capacitor configuration with `bun test scripts/capacitor-config.test.ts`; generate web assets before native synchronization. Why: repeatable TestFlight archives require native source and current bundled assets; signing and archiving happen on a Mac.
