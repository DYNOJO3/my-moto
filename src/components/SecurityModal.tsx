import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Check, 
  AlertTriangle,
  FileCheck,
  ServerOff,
  Cpu
} from 'lucide-react';
import { MedicalProfile } from '../types/medical';
import { 
  setAppPin, 
  clearAppPin, 
  getStoredPinHash, 
  exportProfileAsJSON, 
  DEFAULT_PROFILE 
} from '../utils/storage';

interface SecurityModalProps {
  profile: MedicalProfile;
  onUpdateProfile: (updated: MedicalProfile) => void;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [pinConfirm, setPinConfirm] = useState<string>('');
  const [hasPinSet, setHasPinSet] = useState<boolean>(Boolean(getStoredPinHash()));
  const [pinMessage, setPinMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length < 4) {
      setPinMessage({ text: 'El PIN debe tener al menos 4 dígitos.', type: 'error' });
      return;
    }
    if (pinInput !== pinConfirm) {
      setPinMessage({ text: 'Los PINs no coinciden.', type: 'error' });
      return;
    }
    await setAppPin(pinInput);
    setHasPinSet(true);
    setPinInput('');
    setPinConfirm('');
    setPinMessage({ text: '¡PIN configurado exitosamente! Ahora se solicitará para editar la ficha.', type: 'success' });
  };

  const handleRemovePin = () => {
    clearAppPin();
    setHasPinSet(false);
    setPinMessage({ text: 'PIN de protección eliminado.', type: 'success' });
  };

  const handleExportBackup = () => {
    exportProfileAsJSON(profile);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.fullName && parsed.bloodType) {
          onUpdateProfile(parsed);
          setPinMessage({ text: 'Ficha importada y restaurada exitosamente.', type: 'success' });
        } else {
          setPinMessage({ text: 'El archivo JSON no tiene un formato de ficha SOS válido.', type: 'error' });
        }
      } catch {
        setPinMessage({ text: 'Error al leer el archivo JSON.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefault = () => {
    if (confirm('¿Deseas restablecer la ficha con los datos de demostración? Se sobrescribirá tu perfil actual.')) {
      onUpdateProfile(DEFAULT_PROFILE);
      setPinMessage({ text: 'Perfil restablecido al ejemplo inicial.', type: 'success' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              Seguridad y Privacidad de Datos Médicos
            </h1>
            <p className="text-xs text-slate-400">
              Cifrado local de extremo a extremo, cero servidores y arquitectura 100% offline.
            </p>
          </div>
        </div>
      </div>

      {/* Security Pillars Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ServerOff className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Cero Servidores Terceros</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ninguna entidad externa ni servidor web almacena tus alergias, dirección o contactos. Los datos residen exclusivamente en la memoria local de tu dispositivo.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Cifrado Local WebCrypto</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Utiliza la API nativa del navegador con algoritmo estándar AES-GCM de 256 bits y derivación de llaves PBKDF2 SHA-256.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Total Portabilidad Offline</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Compatible con dispositivos Android y lectores estándar. Funciona en modo avión y zonas sin cobertura satelital o celular.
          </p>
        </div>
      </div>

      {/* PIN Protection Setup */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Protección con PIN para Edición
              </h2>
              <p className="text-xs text-slate-500">
                Evita que terceros o curiosos modifiquen tus datos médicos cuando manipulen tu teléfono.
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              hasPinSet ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {hasPinSet ? '✓ PIN ACTIVO' : 'SIN PIN'}
          </span>
        </div>

        {pinMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              pinMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {pinMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{pinMessage.text}</span>
          </div>
        )}

        {hasPinSet ? (
          <div className="flex items-center justify-between p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <div>
              <span className="font-bold text-emerald-950 text-sm block">
                Tu perfil está protegido con PIN seguro
              </span>
              <span className="text-xs text-emerald-700">
                Se requiere ingresar el PIN antes de acceder a la pestaña de edición.
              </span>
            </div>

            <button
              onClick={handleRemovePin}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 cursor-pointer shadow-xs"
            >
              Desactivar PIN
            </button>
          </div>
        ) : (
          <form onSubmit={handleSetPin} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nuevo PIN (4 a 8 dígitos)
              </label>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirmar PIN
              </label>
              <input
                type="password"
                maxLength={8}
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Establecer PIN
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Backup and Restore */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Key className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="font-bold text-slate-900 text-base">Copia de Seguridad y Restauración</h2>
            <p className="text-xs text-slate-500">
              Guarda un archivo de respaldo en tu teléfono u ordenador para no perder tus datos al borrar cookies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 text-sm block mb-1">
                Exportar Ficha Médica (.json)
              </span>
              <p className="text-xs text-slate-600 mb-3">
                Descarga un archivo local con toda tu información estructurada.
              </p>
            </div>

            <button
              onClick={handleExportBackup}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Archivo JSON</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 text-sm block mb-1">
                Restaurar desde Copia (.json)
              </span>
              <p className="text-xs text-slate-600 mb-3">
                Carga un archivo de respaldo previamente exportado.
              </p>
            </div>

            <label className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm">
              <Upload className="w-4 h-4" />
              <span>Seleccionar Archivo JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Reset to Default */}
      <div className="p-4 bg-slate-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <RotateCcw className="w-4 h-4" />
          <span>¿Quieres restablecer la ficha con los datos de ejemplo predeterminados?</span>
        </div>

        <button
          onClick={handleResetDefault}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 cursor-pointer shadow-xs"
        >
          Restablecer Ejemplo
        </button>
      </div>
    </div>
  );
};
