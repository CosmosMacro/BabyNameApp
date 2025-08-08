import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.babyname.app',
  appName: 'BabyNameApp',
  webDir: 'build',
  plugins: {
    'CapacitorSocialLogin': {
      'google': {
        'serverClientId': '199219615204-7urjhh17lfti8s68kleh2e4o9tvp5jkp.apps.googleusercontent.com'
      }
    }
  }
};

export default config;
