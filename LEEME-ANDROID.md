# SOS Médico → APK Android (Capacitor)

## Qué hace este kit
- Convierte tu app web en un proyecto Android nativo (Capacitor 7) con ID `com.dynojo3.sosmedico`.
- Un solo script (`scripts/prepare-android.mjs`) aplica los ajustes a tu código, genera íconos, compila y sincroniza Android.
- Un workflow de GitHub Actions compila el APK en la nube, sin instalar nada.

## Optimizaciones incluidas
- Fuentes empaquetadas (antes venían de Google Fonts: sin internet se veía mal).
- Sin service worker en Android (los archivos ya van dentro del APK).
- QR generator con carga diferida (la librería `qrcode` solo se carga al usarla).
- Quitadas dependencias que no se usaban: `@google/genai`, `express`, `dotenv`, `motion`, `tsx`, `esbuild`, `autoprefixer`.
- R8 + recorte de recursos en el build release, y `allowBackup=false` (los datos médicos no se suben al backup de Google).
- Descargas de PNG/JSON adaptadas a Android: abren el menú Compartir/Guardar (el `<a download>` no funciona en WebView).
- Botón "atrás" de Android, barra de estado y orientación vertical.
- Se ocultan los botones "Instalar App" dentro del APK.

## Opción A: sin instalar nada (GitHub Actions)
1. Descomprime este kit **encima de la raíz de tu repo** (sobrescribe `package.json`, `vite.config.ts`, `.env.example`, `src/index.css`, `src/main.tsx`).
2. En GitHub: Settings → Secrets and variables → Actions → **Variables** → crea `VITE_PUBLIC_APP_URL` con la URL pública de tu web (ver "Importante").
3. Haz commit y push. Ve a la pestaña **Actions → Build APK Android** (o ejecútalo con "Run workflow").
4. Al terminar, descarga el artefacto **SOS-Medico-apk** → `app-debug.apk` → instálalo en el celular (permite "instalar apps desconocidas").

## Opción B: en tu PC
Requisitos: Node 22, JDK 21, Android Studio.
```
npm install
node scripts/prepare-android.mjs
npx cap open android      # Build > Build APK(s)
```
o por consola: `cd android && gradlew assembleDebug`
El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

## Importante (léelo)
1. **El QR "Ficha Web SOS" necesita una web publicada.** El celular del rescatista no tiene tu app, así que el QR debe abrir una URL pública (GitHub Pages, Netlify, Vercel...). Publica `dist/` ahí con `npm run build` y pon esa URL en `VITE_PUBLIC_APP_URL`. Sin eso, usa el QR "Texto 100% Offline" o "vCard", que no dependen de internet.
2. **Es un APK de pruebas (debug).** Para Google Play necesitas un `.aab` firmado: `gradlew bundleRelease` con tu keystore. Pruébalo bien, porque R8 está activo en release.
3. **Privacidad:** los datos están en `localStorage` sin cifrar por defecto, y el PIN solo bloquea la pantalla de edición, no cifra nada. Para una app médica conviene activar el cifrado AES que ya tienes en `crypto.ts`.
4. No pude compilar ni probar el APK en mi entorno (sin Android SDK ni red). Los parches de código sí los probé con fragmentos de tus archivos; si algún patrón no coincide, el script lo avisa en consola sin romper nada.
