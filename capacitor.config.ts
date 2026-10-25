import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ceomindos.app',
  appName: 'CEO Mind OS',
  webDir: 'dist',
  ios: {
    // Keep web content below the Dynamic Island / status bar. Individual
    // fixed overlays still use CSS safe-area environment values.
    contentInset: 'automatic',
  },
};

export default config;
