import { Capacitor } from '@capacitor/core';

const preferences = Capacitor.Plugins?.Preferences;
const isNative = Capacitor.isNativePlatform();

export const storage = {
  async getItem(key) {
    if (isNative && preferences) {
      const { value } = await preferences.get({ key });
      return value ?? null;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  async setItem(key, value) {
    if (isNative && preferences) {
      await preferences.set({ key, value });
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  }
};
