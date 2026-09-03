import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.patilife.app',
  appName: 'PatiLife',
  webDir: 'www',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'never',
    preferredContentMode: 'mobile',
    scheme: 'PatiLife'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#f5eee6',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#f5eee6'
    }
  }
};

export default config;
