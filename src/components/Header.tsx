import React from 'react';
import { Shield, QrCode, FileText, Lock, Volume2, VolumeX, AlertTriangle, Smartphone } from 'lucide-react';
import { isAlarmRunning, startSOSAlarm, stopSOSAlarm } from '../utils/audioAlert';

interface HeaderProps {
  currentTab: 'emergency' | 'qr' | 'editor' | 'security';
  setCurrentTab: (tab: 'emergency' | 'qr' | 'editor' | 'security') => void;
  hasPin: boolean;
  isEncrypted: boolean;
  onOpenStrobe: () => void;
  onOpenAndroidInstall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  hasPin,
  isEncrypted,
  onOpenStrobe,
  onOpenAndroidInstall,
}) => {
  const [alarmActive, setAlarmActive] = React.useState(isAlarmRunning());

  const toggleAlarm = () => {
    if (alarmActive) {
      stopSOSAlarm((active) => setAlarmActive(active));
    } else {
      startSOSAlarm((active) => setAlarmActive(active));
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      {/* Top emergency status banner */}
      <div className="bg-red-700 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SISTEMA 100% OFFLINE • CIFRADO LOCAL AES-256 • PRIVACIDAD GARANTIZADA</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAndroidInstall}
            className="hover:underline flex items-center gap-1 font-bold text-amber-200 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
            <span>App Android</span>
          </button>
          <button
            onClick={onOpenStrobe}
            title="Linterna estroboscópica de auxilio"
            className="hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="hidden sm:inline">Luz Estroboscópica</span> 🚨
          </button>
          <button
            onClick={toggleAlarm}
            className={`flex items-center gap-1 px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
              alarmActive ? 'bg-amber-400 text-slate-900 animate-bounce' : 'bg-red-800 hover:bg-red-900 text-white'
            }`}
          >
            {alarmActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{alarmActive ? 'SILENCIAR' : 'SIRENA SOS'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            onClick={() => setCurrentTab('emergency')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-md shadow-red-900/50 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-red-400 transition-colors">
                  QR SOS Médico
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  ANDROID
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Ficha de Emergencia, Llamada en 1 Clic y Datos Médicos
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('emergency')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'emergency'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>Ficha SOS</span>
            </button>

            <button
              onClick={() => setCurrentTab('qr')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'qr'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Generar QR</span>
            </button>

            <button
              onClick={() => setCurrentTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'editor'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">Editar</span> Perfil
            </button>

            <button
              onClick={() => setCurrentTab('security')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'security'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Lock className={`w-4 h-4 ${hasPin || isEncrypted ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden lg:inline">Seguridad</span>
            </button>

            <button
              onClick={onOpenAndroidInstall}
              className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-extrabold bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/40 cursor-pointer transition-all"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Instalar App</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
