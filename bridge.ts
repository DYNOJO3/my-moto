// Prepara todo el proyecto Android de forma automática e idempotente.
// Uso: node scripts/prepare-android.mjs
import fs from 'fs';
import { execSync } from 'child_process';

const run = (cmd, env = {}) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
};

const edit = (file, label, fn) => {
  if (!fs.existsSync(file)) return console.warn(`⚠ ${label}: no existe ${file}`);
  const before = fs.readFileSync(file, 'utf8');
  const after = fn(before);
  if (after === before) return console.log(`· ${label}: sin cambios (ya aplicado o patrón no encontrado)`);
  fs.writeFileSync(file, after);
  console.log(`✓ ${label}`);
};

// 1) Ajustes al código fuente ------------------------------------------------
edit('src/App.tsx', 'App.tsx (carga diferida + ocultar instalador web)', (s) => {
  if (s.includes('Suspense')) return s;
  s = s.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, lazy, Suspense } from 'react';"
  );
  s = s.replace(
    "import { QRCardGenerator } from './components/QRCardGenerator';",
    "const QRCardGenerator = lazy(() => import('./components/QRCardGenerator').then((m) => ({ default: m.QRCardGenerator })));"
  );
  s = s.replace('<main className="flex-1 pb-16">', '<main className="flex-1 pb-16">\n        <Suspense fallback={null}>');
  s = s.replace('</main>', '</Suspense>\n      </main>');
  s = s.replace(
    '<div className="bg-slate-900 border-b border-emerald-500/30',
    '<div data-web-only className="bg-slate-900 border-b border-emerald-500/30'
  );
  return s;
});

edit('src/components/Header.tsx', 'Header.tsx (ocultar botones de instalar)', (s) =>
  s.includes('data-web-only') ? s : s.replaceAll('onClick={onOpenAndroidInstall}', 'data-web-only onClick={onOpenAndroidInstall}')
);

edit('src/components/QRCardGenerator.tsx', 'QRCardGenerator.tsx (URL pública del QR)', (s) => {
  if (s.includes('getPublicAppUrl')) return s;
  s = s.replace(
    "import { MedicalProfile } from '../types/medical';",
    "import { MedicalProfile } from '../types/medical';\nimport { getPublicAppUrl } from '../utils/publicUrl';"
  );
  return s.replace('const baseAppUrl = window.location.origin + window.location.pathname;', 'const baseAppUrl = getPublicAppUrl();');
});

edit('index.html', 'index.html (quitar Google Fonts, ahora van empaquetadas)', (s) =>
  s.replace(/^[ \t]*<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>[ \t]*\r?\n/gm, '')
);

// 2) Iconos ------------------------------------------------------------------
run('node scripts/generate-icons.js');
fs.mkdirSync('assets', { recursive: true });
fs.copyFileSync('public/pwa-512x512.png', 'assets/icon-only.png');
fs.copyFileSync('public/pwa-512x512.png', 'assets/icon-foreground.png');

// 3) Build web optimizado + plataforma Android --------------------------------
run('npx vite build', { BUILD_TARGET: 'android' });
if (!fs.existsSync('android')) run('npx cap add android');

// 4) Ajustes nativos ----------------------------------------------------------
edit('android/app/src/main/AndroidManifest.xml', 'Manifest (sin backup en la nube + vertical)', (s) => {
  s = s.replace('android:allowBackup="true"', 'android:allowBackup="false"');
  if (!s.includes('screenOrientation')) s = s.replace('android:launchMode="singleTask"', 'android:launchMode="singleTask"\n            android:screenOrientation="portrait"');
  return s;
});

edit('android/app/build.gradle', 'build.gradle (R8 + recorte de recursos en release)', (s) =>
  s.includes('shrinkResources') ? s : s.replace('minifyEnabled false', 'minifyEnabled true\n            shrinkResources true')
);

try {
  run('npx capacitor-assets generate --android --iconBackgroundColor #dc2626 --iconBackgroundColorDark #dc2626');
} catch {
  console.warn('⚠ No se pudieron generar los íconos nativos; se usará el ícono por defecto.');
}

run('npx cap sync android');
console.log('\n✅ Listo. Compila con: cd android && gradlew assembleDebug   (o abre Android Studio: npx cap open android)');
