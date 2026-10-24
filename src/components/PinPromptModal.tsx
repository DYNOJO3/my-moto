import React, { useState } from 'react';
import { Lock, X, Check, AlertCircle } from 'lucide-react';
import { verifyAppPin } from '../utils/storage';

interface PinPromptModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const PinPromptModal: React.FC<PinPromptModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const valid = await verifyAppPin(pin);
    if (valid) {
      setPin('');
      onSuccess();
    } else {
      setError('PIN incorrecto. Inténtalo de nuevo.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
            <Lock className="w-5 h-5 text-red-600" />
            <span>Perfil Protegido por PIN</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Ingresa tu PIN de seguridad para acceder a la edición de la ficha médica.
        </p>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              autoFocus
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-center tracking-widest text-2xl font-black focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Desbloquear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
