import { Capacitor } from '@capacitor/core';

export const IS_NATIVE = Capacitor.isNativePlatform();

const safeName = (n: string) => n.replace(/[\\/:*?"<>|]/g, '_') || 'archivo';

async function hrefToBase64(href: string): Promise<string> {
  if (href.startsWith('data:')) {
    const comma = href.indexOf(',');
    const meta = href.slice(5, comma);
    const payload = href.slice(comma + 1);
    if (meta.includes(';base64')) return payload;
    const bytes = new TextEncoder().encode(decodeURIComponent(payload));
    let bin = '';
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  }
  const blob = await (await fetch(href)).blob();
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.readAsDataURL(blob);
  });
}

async function saveAndShare(href: string, filename: string) {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const { Share } = await import('@capacitor/share');
  const name = safeName(filename);
  const data = await hrefToBase64(href);
  const { uri } = await Filesystem.writeFile({ path: name, data, directory: Directory.Cache });
  await Share.share({ title: name, files: [uri], dialogTitle: 'Guardar o compartir' });
}

export async function initNative() {
  if (!IS_NATIVE) return;
  document.documentElement.classList.add('native-app');

  // Las descargas por <a download> no funcionan en un WebView: se guardan y se abre el menú "Compartir/Guardar".
  const originalClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
    if (this.hasAttribute('download') && /^(data|blob):/.test(this.href)) {
      saveAndShare(this.href, this.download).catch((e) => console.warn('Descarga cancelada/fallida', e));
      return;
    }
    return originalClick.call(this);
  };

  window.print = () => {
    alert('Para imprimir: descarga la imagen PNG y envíala a imprimir desde tu galería.');
  };

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0f172a' });
  } catch { /* opcional */ }

  try {
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else App.minimizeApp();
    });
  } catch { /* opcional */ }
}
