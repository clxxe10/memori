import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.memori.app',
  appName: 'Memori',
  webDir: 'public',
  server: {
    url: 'https://memori-seven.vercel.app',
    cleartext: true,
  },
};

export default config;
