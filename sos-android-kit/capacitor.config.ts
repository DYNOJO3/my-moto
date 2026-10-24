import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dynojo3.sosmedico',
  appName: 'SOS Médico',
  webDir: 'dist',
  backgroundColor: '#0f172a',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      launchAutoHide: true,
      backgroundColor: '#dc2626',
      showSpinner: false,
    },
  },
};

export default config;
