import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ceomindos.app',
  appName: 'CEO Mind OS',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
  },
};

export default config;
