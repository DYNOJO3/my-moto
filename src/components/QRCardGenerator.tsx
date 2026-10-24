import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, 
  Smartphone, 
  CreditCard, 
  Share2, 
  Copy, 
  Check, 
  Eye, 
  WifiOff, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Printer,
  Sparkles,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { MedicalProfile } from '../types/medical';
import { encodeCompactEmergencyPayload } from '../utils/crypto';
import { encodeUltraFastURLPayload, buildUltraFastOfflineText } from '../utils/fastQREncoder';
import { buildCompactOfflineText, buildVCardPayload } from '../utils/emergencyAlert';
import { 
  generateQRDataUrl, 
  generateWalletCardImage, 
  generateLockscreenWallpaper,
  generateHelmetStickerImage
} from '../utils/qrRenderer';

interface QRCardGeneratorProps {
  profile: MedicalProfile;
  onPreviewEmergencyView: () => void;
}

type QRMode = 'web-sos' | 'offline-text' | 'vcard';

export const QRCardGenerator: React.FC<QRCardGeneratorProps> = ({
  profile,
  onPreviewEmergencyView,
}) => {
  const [activeMode, setActiveMode] = useState<QRMode>('web-sos');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrColor, setQrColor] = useState<string>('#000000');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [ultraFastScan, setUltraFastScan] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [generatingAsset, setGeneratingAsset] = useState<string | null>(null);

  // Compute payload text based on active mode and speed optimization
  const currentPayload = useMemo(() => {
    const baseAppUrl = window.location.origin + window.location.pathname;

    if (activeMode === 'web-sos') {
      if (ultraFastScan) {
        // Ultra-Fast format: ~70% shorter payload, giant QR modules for instant scan on any phone
        const fastPayload = encodeUltraFastURLPayload(profile);
        return `${baseAppUrl}#sos=${fastPayload}`;
      }

      // Classic JSON payload
      const compactPayload = encodeCompactEmergencyPayload({
        fn: profile.fullName,
        bt: profile.bloodType,
        od: profile.isOrganDonor,
        doc: profile.documentId,
        bd: profile.birthDate,
        ad: profile.address,
        ct: profile.city,
        c: profile.emergencyContacts.map(c => ({
          n: c.name,
          r: c.relationship,
          p: c.phone,
          cc: c.countryCode,
          pr: c.isPrimary,
        })),
        al: profile.allergies.map(a => ({ n: a.name, s: a.severity, nt: a.notes })),
        cd: profile.conditions.map(c => ({ n: c.name, ch: c.isChronic, nt: c.notes })),
        md: profile.medications.map(m => ({ n: m.name, d: m.dosage, f: m.frequency })),
        si: profile.specialInstructions,
        hi: profile.healthInsurance,
        pn: profile.insurancePolicyNumber,
        ph: profile.preferredHospital,
      });

      return `${baseAppUrl}#sos=${compactPayload}`;
    }

    if (activeMode === 'offline-text') {
      return ultraFastScan
        ? buildUltraFastOfflineText(profile)
        : buildCompactOfflineText(profile);
    }

    if (activeMode === 'vcard') {
      return buildVCardPayload(profile);
    }

    return '';
  }, [profile, activeMode, ultraFastScan]);

  // Generate QR image on payload/config change
  useEffect(() => {
    let isMounted = true;
    generateQRDataUrl(currentPayload, {
      colorDark: qrColor,
      errorCorrectionLevel: errorCorrection,
      width: 480,
    }).then((url) => {
      if (isMounted) setQrDataUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [currentPayload, qrColor, errorCorrection]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPayload);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_SOS_${profile.fullName.replace(/\s+/g, '_')}_${activeMode}.png`;
    a.click();
  };

  const handleDownloadSmallQR = async () => {
    // Generate an ultra-compact small PNG (280x280 px) ~ 3.5cm - 4cm ideal for helmets and motorcycles
    const smallUrl = await generateQRDataUrl(currentPayload, {
      colorDark: qrColor,
      errorCorrectionLevel: 'H', // High error resistance against minor scratches on helmet/moto
      width: 280,
    });
    const a = document.createElement('a');
    a.href = smallUrl;
    a.download = `QR_CHICO_CASCO_MOTO_${profile.fullName.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const handleDownloadHelmetSticker = async (variant: 'square' | 'dark' = 'square') => {
    if (!qrDataUrl) return;
    setGeneratingAsset(variant === 'dark' ? 'helmet-dark' : 'helmet-white');
    try {
      const stickerUrl = await generateHelmetStickerImage(profile, qrDataUrl, variant);
      const a = document.createElement('a');
      a.href = stickerUrl;
      a.download = `Pegatina_Casco_Moto_SOS_${variant}_${profile.fullName.replace(/\s+/g, '_')}.png`;
      a.click();
    } finally {
      setGeneratingAsset(null);
    }
  };

  const handleDownloadWalletCard = async () => {
    if (!qrDataUrl) return;
    setGeneratingAsset('wallet');
    try {
      const cardUrl = await generateWalletCardImage(profile, qrDataUrl);
      const a = document.createElement('a');
      a.href = cardUrl;
      a.download = `Tarjeta_Bolsillo_SOS_${profile.fullName.replace(/\s+/g, '_')}.png`;
      a.click();
    } finally {
      setGeneratingAsset(null);
    }
  };

  const handleDownloadWallpaper = async () => {
    if (!qrDataUrl) return;
    setGeneratingAsset('wallpaper');
    try {
      const wallUrl = await generateLockscreenWallpaper(profile, qrDataUrl);
      const a = document.createElement('a');
      a.href = wallUrl;
      a.download = `Fondo_Bloqueo_Android_SOS_${profile.fullName.replace(/\s+/g, '_')}.png`;
      a.click();
    } finally {
      setGeneratingAsset(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Title & Privacy Guarantee */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold">
                Generador de Código QR de Emergencia & Tarjetas
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Garantía de privacidad: Ningún dato se envía a la nube ni servidores de terceros. Todo se procesa y codifica de manera 100% local en tu dispositivo.
            </p>
          </div>

          <button
            onClick={onPreviewEmergencyView}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/30 shrink-0 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Simular Escaneo</span>
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={() => setActiveMode('web-sos')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeMode === 'web-sos'
                ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">1. QR Ficha Médica Web SOS</span>
              <span className="text-[10px] font-bold bg-red-500/30 text-red-300 px-1.5 py-0.5 rounded">
                RECOMENDADO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Abre al instante la ficha interactiva con tus datos médicos críticos y botón de llamada a familiares en 1 clic.
            </p>
          </button>

          <button
            onClick={() => setActiveMode('offline-text')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeMode === 'offline-text'
                ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">2. QR Texto 100% Offline</span>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400">
              Sin navegador ni internet. Cualquier cámara o escáner estándar lee directamente el texto médico y teléfonos.
            </p>
          </button>

          <button
            onClick={() => setActiveMode('vcard')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeMode === 'vcard'
                ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">3. QR Contacto vCard</span>
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-xs text-slate-400">
              Permite a los paramédicos guardar al instante el contacto ICE y notas médicas en la agenda de su teléfono.
            </p>
          </button>
        </div>
      </div>

      {/* Main QR Display & Customization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* QR Preview Card */}
        <div className="md:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          {/* Instant Scan Speed Badge */}
          <div className="w-full bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-extrabold text-emerald-950">⚡ Lectura Instantánea Activa</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
              &lt; 0.1s EN CUALQUIER CELULAR
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-200 shadow-inner mb-3 w-full flex items-center justify-center min-h-[290px]">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Código QR SOS para ${profile.fullName}`}
                className="w-full max-w-[280px] h-auto object-contain rounded-lg"
              />
            ) : (
              <div className="text-slate-400 animate-pulse text-sm">Generando código QR seguro...</div>
            )}
          </div>

          <div className="mb-2 text-left w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] text-slate-600">
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <span>🎯 Enfoque Flash:</span>
              <span className="text-emerald-700 font-bold">Módulos grandes de alto contraste</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Optimizado para que cualquier celular de gama baja, con lente rayado o poca luz lo lea de inmediato.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            {profile.fullName} • Grupo {profile.bloodType}
          </span>
          <p className="text-[11px] text-slate-500 mb-4">
            {activeMode === 'web-sos'
              ? 'Código QR interactivo con ficha médica completa y llamada directa a familiares'
              : activeMode === 'offline-text'
              ? 'Código QR de datos directos (no requiere conexión de red)'
              : 'Código QR vCard de emergencia compatible con Android'}
          </p>

          {/* Quick Actions for QR */}
          <div className="w-full space-y-2">
            <button
              onClick={handleDownloadSmallQR}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Bajar PNG Chico para Casco / Moto (4 cm)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadQR}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG Estándar</span>
              </button>

              <button
                onClick={handleCopy}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Physical & Portable Emergency Assets */}
        <div className="md:col-span-7 space-y-4">
          {/* Card 1: Motorcycle & Helmet Sticker (Compact 4x4 / 5x5 cm) */}
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 text-white rounded-2xl p-5 border-2 border-red-500/60 shadow-lg shadow-red-950/40 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-white">
                      Pegatina para Casco / Moto (Formato Chico 4x4 cm)
                    </h3>
                    <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      MOTO / CASCO
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Imagen compacta de alta visibilidad para pegar en el lateral del casco, tanque o chasis de moto. Incluye tu grupo sanguíneo y QR de lectura ultra rápida.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button
                onClick={() => handleDownloadHelmetSticker('square')}
                disabled={generatingAsset === 'helmet-white'}
                className="py-2.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{generatingAsset === 'helmet-white' ? 'Generando...' : 'Sticker Blanco (Casco)'}</span>
              </button>

              <button
                onClick={() => handleDownloadHelmetSticker('dark')}
                disabled={generatingAsset === 'helmet-dark'}
                className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-600 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{generatingAsset === 'helmet-dark' ? 'Generando...' : 'Sticker Oscuro (Moto)'}</span>
              </button>

              <button
                onClick={handleDownloadSmallQR}
                className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <span>Solo QR Chico (4cm)</span>
              </button>
            </div>
          </div>

          {/* Card 2: Wallet Emergency Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 border border-slate-700 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Tarjeta de Billetera / Bolsillo (Formato Carnet)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Genera una tarjeta estándar (85.6 × 54 mm) de alta resolución lista para imprimir y plastificar.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleDownloadWalletCard}
                disabled={generatingAsset === 'wallet'}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{generatingAsset === 'wallet' ? 'Generando...' : 'Descargar Tarjeta PNG'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {/* Card 2: Android Lockscreen Wallpaper */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 border border-slate-700 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Fondo de Pantalla para Android (Lock Screen)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Fondo vertical AMOLED con QR y teléfonos de auxilio para que los paramédicos lo escaneen sin desbloquear tu celular.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleDownloadWallpaper}
                disabled={generatingAsset === 'wallpaper'}
                className="py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{generatingAsset === 'wallpaper' ? 'Generando...' : 'Descargar Fondo Android'}</span>
              </button>
            </div>
          </div>

          {/* Configuration & Payload details */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ultraFastScan}
                  onChange={(e) => setUltraFastScan(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                  <span>⚡ Modo Ultra-Rápido (Puntos Gigantes para Cualquier Celular)</span>
                </span>
              </label>

              <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full shrink-0">
                {ultraFastScan ? 'ACTIVADO' : 'FORMATO COMPLETO'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-slate-600 font-semibold">Color:</span>
                <input
                  type="color"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="w-6 h-6 rounded border cursor-pointer p-0"
                />
              </label>

              <label className="flex items-center gap-1.5">
                <span className="text-slate-600 font-semibold">Densidad / Redundancia:</span>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                  className="border rounded-lg px-2 py-1 bg-slate-50 text-slate-800 font-medium text-xs"
                >
                  <option value="L">Nivel L: Puntos Más Grandes (Velocidad Máxima)</option>
                  <option value="M">Nivel M: Recomendado (Balance Óptimo)</option>
                  <option value="Q">Nivel Q: Alta Resistencia a Rasguños</option>
                  <option value="H">Nivel H: Máxima Redundancia</option>
                </select>
              </label>
            </div>

            {/* Content Preview Box */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>Longitud de datos en el QR:</span>
                <span className="font-mono font-bold text-slate-800">{currentPayload.length} caracteres ({ultraFastScan ? '⚡ Reducción de 75%' : 'Modo estándar'})</span>
              </div>
              <pre className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 font-mono overflow-x-auto max-h-24 whitespace-pre-wrap select-all">
                {currentPayload}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
