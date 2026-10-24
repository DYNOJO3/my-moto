import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EmergencyView } from './components/EmergencyView';
import { QRCardGenerator } from './components/QRCardGenerator';
import { ProfileEditor } from './components/ProfileEditor';
import { SecurityModal } from './components/SecurityModal';
import { StrobeModal } from './components/StrobeModal';
import { PinPromptModal } from './components/PinPromptModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { MedicalProfile, BloodType, EmergencyContact, AllergyItem, ConditionItem, MedicationItem } from './types/medical';
import { 
  loadProfileFromStorage, 
  saveProfileToStorage, 
  getStoredPinHash, 
  DEFAULT_PROFILE 
} from './utils/storage';
import { decodeCompactEmergencyPayload } from './utils/crypto';
import { decodeUltraFastURLPayload } from './utils/fastQREncoder';
import { AlertTriangle, CheckCircle, Shield, Wifi, WifiOff, Smartphone } from 'lucide-react';

interface CompactDecoded {
  fn?: string;
  bt?: BloodType;
  od?: boolean;
  doc?: string;
  bd?: string;
  ad?: string;
  ct?: string;
  c?: Array<{
    n: string;
    r: string;
    p: string;
    cc: string;
    pr?: boolean;
  }>;
  al?: Array<{
    n: string;
    s: 'Crítica / Anafilaxia' | 'Severa' | 'Moderada' | 'Leve';
    nt?: string;
  }>;
  cd?: Array<{
    n: string;
    ch?: boolean;
    nt?: string;
  }>;
  md?: Array<{
    n: string;
    d?: string;
    f?: string;
  }>;
  si?: string;
  hi?: string;
  pn?: string;
  ph?: string;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'emergency' | 'qr' | 'editor' | 'security'>('emergency');
  const [profile, setProfile] = useState<MedicalProfile>(DEFAULT_PROFILE);
  const [scannedProfile, setScannedProfile] = useState<MedicalProfile | null>(null);
  const [isScannedMode, setIsScannedMode] = useState<boolean>(false);
  const [isStrobeOpen, setIsStrobeOpen] = useState<boolean>(false);
  const [isPinPromptOpen, setIsPinPromptOpen] = useState<boolean>(false);
  const [isAndroidInstallOpen, setIsAndroidInstallOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [hasPin, setHasPin] = useState<boolean>(Boolean(getStoredPinHash()));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Monitor online / offline network state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load profile from storage or parse from URL hash if opened via QR code scan
  useEffect(() => {
    const checkHashAndLoad = async () => {
      const hash = window.location.hash;
      if (hash.startsWith('#sos=')) {
        const encoded = hash.replace('#sos=', '');
        
        // 1. Try Ultra-Fast payload decoder first
        const fastDecoded = decodeUltraFastURLPayload(encoded);
        if (fastDecoded && fastDecoded.fullName) {
          setScannedProfile(fastDecoded);
          setIsScannedMode(true);
          setCurrentTab('emergency');
          return;
        }

        // 2. Fallback to classic JSON base64 decoder
        const decoded = decodeCompactEmergencyPayload<CompactDecoded>(encoded);
        if (decoded && decoded.fn) {
          const reconstructed: MedicalProfile = {
            id: `scanned_${Date.now()}`,
            updatedAt: new Date().toISOString(),
            fullName: decoded.fn,
            bloodType: decoded.bt || 'Desconocido',
            isOrganDonor: Boolean(decoded.od),
            documentId: decoded.doc || '',
            birthDate: decoded.bd || '',
            address: decoded.ad || '',
            city: decoded.ct || '',
            emergencyContacts: (decoded.c || []).map((c, i) => ({
              id: `sc_${i}`,
              name: c.n,
              relationship: c.r,
              phone: c.p,
              countryCode: c.cc || '+34',
              isPrimary: Boolean(c.pr),
              notifyViaWhatsApp: true,
            })),
            allergies: (decoded.al || []).map((a, i) => ({
              id: `sa_${i}`,
              name: a.n,
              severity: a.s,
              notes: a.nt,
            })),
            conditions: (decoded.cd || []).map((cd, i) => ({
              id: `scd_${i}`,
              name: cd.n,
              isChronic: Boolean(cd.ch),
              notes: cd.nt,
            })),
            medications: (decoded.md || []).map((m, i) => ({
              id: `sm_${i}`,
              name: m.n,
              dosage: m.d,
              frequency: m.f,
            })),
            specialInstructions: decoded.si || '',
            healthInsurance: decoded.hi || '',
            insurancePolicyNumber: decoded.pn || '',
            preferredHospital: decoded.ph || '',
            isEncrypted: false,
            hasPinProtection: false,
            allowPublicAddressInQR: true,
            allowCompactOfflineMode: true,
          };

          setScannedProfile(reconstructed);
          setIsScannedMode(true);
          setCurrentTab('emergency');
          return;
        }
      }

      // Normal stored profile load
      try {
        const { profile: loaded } = await loadProfileFromStorage();
        setProfile(loaded);
      } catch (err) {
        console.error('Error loading stored profile:', err);
      }
    };

    checkHashAndLoad();
  }, []);

  const handleTabChange = (targetTab: 'emergency' | 'qr' | 'editor' | 'security') => {
    // If user tries to open editor and a PIN is set, verify PIN first
    if (targetTab === 'editor' && getStoredPinHash()) {
      setIsPinPromptOpen(true);
      return;
    }
    setCurrentTab(targetTab);
  };

  const handlePinSuccess = () => {
    setIsPinPromptOpen(false);
    setCurrentTab('editor');
  };

  const handleSaveProfile = async (updated: MedicalProfile) => {
    setProfile(updated);
    await saveProfileToStorage(updated);
    setToastMessage('Ficha médica de emergencia guardada localmente');
    setTimeout(() => setToastMessage(null), 3000);
    setCurrentTab('emergency');
  };

  const activeDisplayProfile = isScannedMode && scannedProfile ? scannedProfile : profile;

  const exitScannedMode = () => {
    setIsScannedMode(false);
    setScannedProfile(null);
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        hasPin={hasPin}
        isEncrypted={profile.isEncrypted}
        onOpenStrobe={() => setIsStrobeOpen(true)}
        onOpenAndroidInstall={() => setIsAndroidInstallOpen(true)}
      />

      {/* Android Mobile Install Callout Bar */}
      <div className="bg-slate-900 border-b border-emerald-500/30 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
          <span className="text-slate-300 font-medium">
            <strong className="text-white">Compatible con Android:</strong> Instálala en tu celular para tener acceso directo y usarla 100% offline en cualquier carretera o emergencia.
          </span>
        </div>
        <button
          onClick={() => setIsAndroidInstallOpen(true)}
          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] cursor-pointer shadow-sm transition-all active:scale-95 shrink-0"
        >
          Instalar App Android
        </button>
      </div>

      {/* Scanned Badge Banner if user opened through QR code */}
      {isScannedMode && (
        <div className="bg-amber-400 text-slate-950 px-4 py-2.5 text-xs font-bold flex items-center justify-between border-b border-amber-500">
          <div className="flex items-center gap-2 max-w-3xl">
            <AlertTriangle className="w-4 h-4 shrink-0 text-slate-900" />
            <span>
              MODO RESCATISTA: Has abierto la ficha de emergencia escaneada para {activeDisplayProfile.fullName}.
            </span>
          </div>
          <button
            onClick={exitScannedMode}
            className="px-3 py-1 rounded-lg bg-black text-white hover:bg-slate-800 text-[11px] cursor-pointer shrink-0"
          >
            Ver Mi Ficha Personal
          </button>
        </div>
      )}

      {/* Main App Content Body */}
      <main className="flex-1 pb-16">
        {currentTab === 'emergency' && (
          <EmergencyView
            profile={activeDisplayProfile}
            isScannedView={isScannedMode}
            onEditProfile={() => handleTabChange('editor')}
            onOpenStrobe={() => setIsStrobeOpen(true)}
          />
        )}

        {currentTab === 'qr' && (
          <QRCardGenerator
            profile={profile}
            onPreviewEmergencyView={() => setCurrentTab('emergency')}
          />
        )}

        {currentTab === 'editor' && (
          <ProfileEditor
            initialProfile={profile}
            onSave={handleSaveProfile}
            onCancel={() => setCurrentTab('emergency')}
          />
        )}

        {currentTab === 'security' && (
          <SecurityModal
            profile={profile}
            onUpdateProfile={(updated) => {
              setProfile(updated);
              saveProfileToStorage(updated);
              setHasPin(Boolean(getStoredPinHash()));
              setToastMessage('Configuración de seguridad actualizada');
              setTimeout(() => setToastMessage(null), 3000);
            }}
            onClose={() => setCurrentTab('emergency')}
          />
        )}
      </main>

      {/* Android Install Modal */}
      <AndroidInstallModal
        isOpen={isAndroidInstallOpen}
        onClose={() => setIsAndroidInstallOpen(false)}
      />

      {/* Strobe Light Modal */}
      <StrobeModal
        isOpen={isStrobeOpen}
        onClose={() => setIsStrobeOpen(false)}
      />

      {/* PIN Prompt Modal */}
      <PinPromptModal
        isOpen={isPinPromptOpen}
        onSuccess={handlePinSuccess}
        onClose={() => setIsPinPromptOpen(false)}
      />

      {/* Offline Status & Security Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-semibold">
              QR SOS Médico • Almacenamiento Local Cifrado (WebCrypto AES-256)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Conectado (Llamadas & Ficha lista)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>100% Modo Offline Activo</span>
                </>
              )}
            </span>
            <span className="text-slate-500">|</span>
            <button
              onClick={() => setCurrentTab('security')}
              className="hover:underline text-slate-300 cursor-pointer"
            >
              Auditoría de Privacidad
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
