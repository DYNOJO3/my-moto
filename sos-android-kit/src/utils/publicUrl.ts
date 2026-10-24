import { Capacitor } from '@capacitor/core';

/**
 * URL base que se incrusta en el QR "Ficha Web SOS".
 * En la app Android, window.location es https://localhost (inútil para otro celular),
 * por eso se usa VITE_PUBLIC_APP_URL (la versión web publicada).
 */
export function getPublicAppUrl(): string {
  const env = import.meta.env.VITE_PUBLIC_APP_URL as string | undefined;
  if (env) return env.replace(/\/?$/, '/');
  if (!Capacitor.isNativePlatform()) return window.location.origin + window.location.pathname;
  return 'https://CONFIGURA-VITE_PUBLIC_APP_URL.invalid/';
}
