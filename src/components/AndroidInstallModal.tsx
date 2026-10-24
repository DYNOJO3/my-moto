import React from 'react';
import { 
  Smartphone, 
  X, 
  Download, 
  CheckCircle, 
  Zap, 
  WifiOff, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/40 shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">
                  Instalar en Android
                </h2>
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  APP NATIVA PWA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lleva tu ficha médica de auxilio en el celular sin depender de internet.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State: Already installed */}
        {isInstalled ? (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 text-emerald-300 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <strong className="text-white block text-sm">¡La app ya está instalada en tu dispositivo!</strong>
              Puedes abrirla directamente desde el icono en la pantalla de inicio o cajón de aplicaciones de Android.
            </div>
          </div>
        ) : isInstallable ? (
          /* Instant 1-Click Install Button */
          <div className="space-y-3">
            <button
              onClick={handleInstallClick}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-900/40 cursor-pointer active:scale-98 transition-transform"
            >
              <Download className="w-5 h-5" />
              <span>INSTALAR AHORA EN ANDROID (1 TOQUE)</span>
            </button>
            <p className="text-center text-[11px] text-slate-400">
              Se creará un acceso nativo con ícono propio en tu pantalla principal.
            </p>
          </div>
        ) : (
          /* Manual Step-by-Step for Android Chrome / Browsers */
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              Cómo instalarla en tu teléfono Android en 3 pasos:
            </span>
            <ol className="text-xs text-slate-300 space-y-2.5 pl-2 list-decimal list-inside">
              <li>
                En tu navegador móvil (Chrome / Brave / Edge), toca el <strong>icono de los tres puntos ⋮</strong> (arriba a la derecha).
              </li>
              <li>
                Selecciona la opción <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.
              </li>
              <li>
                Pulsa <strong>"Instalar"</strong>. ¡Listo! Se abrirá como cualquier app nativa de Android (.apk) sin barra de navegación.
              </li>
            </ol>
          </div>
        )}

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <WifiOff className="w-4 h-4" />
              <span>100% Offline</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Funciona sin señal, datos ni WiFi en cualquier carretera o montaña.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Zap className="w-4 h-4" />
              <span>Carga Instantánea</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Apertura ultrarrápida para emergencias médicas críticas.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <Layers className="w-4 h-4" />
              <span>Pantalla Completa</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Sin barra de URL ni elementos del navegador; interfaz táctil pura.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacidad Total</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Tus datos quedan cifrados en tu teléfono; sin servidores ajenos.
            </p>
          </div>
        </div>

        {/* APK / PWA Builder info */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>¿Quieres empaquetar un archivo .APK para Google Play?</span>
          <a
            href="https://www.pwabuilder.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>PWABuilder APK</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
        >
          Entendido, cerrar
        </button>
      </div>
    </div>
  );
};
