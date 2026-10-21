# CEO Mind OS — iOS TestFlight preparation

## Prepared in this project

- Capacitor core, CLI, and iOS packages are installed (8.5.3).
- Production configuration uses `com.ceomindos.app`, `CEO Mind OS`, and bundled `dist` assets. There is no `server` override or sandbox URL.
- The native Swift Package Manager project is generated at `ios/App/App.xcodeproj`.
- Debug and Release bundle identifiers are `com.ceomindos.app`; display name is `CEO Mind OS`.
- Initial version is `1.0`, build number `1`, minimum deployment target iOS 15.0.
- Configuration checks: `bun test scripts/capacitor-config.test.ts`.
- Checkout, subscription logic, and pricing are unchanged.

## GitHub synchronization — not verified

The local repository contains the earlier Capacitor setup commit `8858917a`. This does not prove the GitHub `main` branch contains it or the production changes made afterwards.

In Lovable, open **Project settings → Git** and confirm the correct GitHub repository, synced branch `main`, and successful synchronization. On GitHub, inspect `main` for `capacitor.config.ts`, the Capacitor dependencies in `package.json`, and `ios/App/App.xcodeproj/project.pbxproj`. The final config must contain no `server` block.

## Build on your Mac

Prerequisites: active Apple Developer membership, current Apple-accepted Xcode/iOS SDK, Xcode command-line tools, Node.js 22 or newer, and access to this repository. Open Xcode once to install required components and accept its license.

After these changes have synchronized to GitHub, pull the project on your Mac first:

```bash
git pull origin main
npm install
npm run build
npx cap sync ios
npx cap open ios
```

The iOS project is already generated; do not run `cap add ios` again. The build must succeed and create `dist/index.html` before synchronization. Native asset synchronization was not completed in the Lovable sandbox because `dist` was absent; no placeholder web bundle was created.

For subsequent updates, always pull first, rebuild the web assets, then run `npx cap sync ios`. Keep generated web assets and generated native configuration out of Git as specified in the existing ignore files.

## Signing and upload

1. In App Store Connect, create/select the app with bundle ID `com.ceomindos.app`. Register this explicit identifier in your Apple Developer account if needed.
2. In Xcode, select **App → Signing & Capabilities**, choose your Apple Developer team, and enable automatic signing. Do not commit personal signing credentials or certificates.
3. Confirm the Release bundle identifier and display name. Set your release version and a unique build number; increment the build number on every upload.
4. Replace the generated placeholder app icon/splash assets with approved CEO Mind OS artwork. Add any usage descriptions required by phone features actually used, and review privacy manifests/disclosures.
5. Run on a real iPhone first: verify safe areas, scrolling, sign-in, restored sessions, routine persistence, audio playback, and network-error behavior.
6. Choose **Any iOS Device (arm64)** (not a simulator), then **Product → Archive**.
7. In Organizer, **Validate App**, then **Distribute App → App Store Connect → Upload**.
8. In App Store Connect → TestFlight, complete export-compliance questions accurately, provide test instructions/review access, and add internal testers. External testing requires Apple's beta review.

## Still requires device/release verification

- OAuth and emailed sign-in links currently use website-origin redirects; return-to-native session handling has not been verified. Do not assume Google/Apple/magic-link login is ready inside the native shell.
- Existing PWA service-worker behavior must be checked in the packaged iOS app. It was not changed during this preparation.
- Checkout and subscriptions are intentionally unchanged. Review Apple's applicable payment rules for digital subscriptions before TestFlight external review or App Store submission; this preparation is not confirmation of payment-policy compliance.
- A signed archive, upload, branded icon, and on-device tests require your Mac and Apple account; none has been completed here.

Read the Capacitor mobile workflow guide: https://lovable.dev/blog/how-to-build-a-mobile-app-with-lovable-capacitor