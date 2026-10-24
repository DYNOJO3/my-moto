import React, { useEffect, useState } from 'react';
import { X, Zap, Volume2, VolumeX } from 'lucide-react';
import { isAlarmRunning, startSOSAlarm, stopSOSAlarm } from '../utils/audioAlert';

interface StrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrobeModal: React.FC<StrobeModalProps> = ({ isOpen, onClose }) => {
  const [colorToggle, setColorToggle] = useState<boolean>(false);
  const [alarmActive, setAlarmActive] = useState<boolean>(isAlarmRunning());
  const [speedMs, setSpeedMs] = useState<number>(250);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setColorToggle((prev) => !prev);
    }, speedMs);

    return () => clearInterval(interval);
  }, [isOpen, speedMs]);

  if (!isOpen) return null;

  const toggleAlarm = () => {
    if (alarmActive) {
      stopSOSAlarm((active) => setAlarmActive(active));
    } else {
      startSOSAlarm((active) => setAlarmActive(active));
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 transition-colors duration-100 select-none ${
        colorToggle ? 'bg-red-600 text-white' : 'bg-white text-slate-900'
      }`}
    >
      {/* Top action bar */}
      <div className="w-full max-w-md flex items-center justify-between bg-black/70 backdrop-blur-md px-4 py-3 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="font-extrabold text-sm tracking-wider uppercase">
            Baliza SOS Nocturna
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center visual text */}
      <div className="text-center space-y-2 pointer-events-none">
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter drop-shadow-md">
          SOS
        </h1>
        <p className="text-xl sm:text-2xl font-bold uppercase tracking-widest drop-shadow">
          Auxilio Médico
        </p>
      </div>

      {/* Bottom controls */}
      <div className="w-full max-w-md bg-black/80 backdrop-blur-md p-4 rounded-2xl text-white space-y-3 shadow-2xl">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-semibold">Velocidad de destello:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSpeedMs(150)}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                speedMs === 150 ? 'bg-amber-400 text-black' : 'bg-white/20'
              }`}
            >
              Rápido
            </button>
            <button
              onClick={() => setSpeedMs(350)}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                speedMs === 350 ? 'bg-amber-400 text-black' : 'bg-white/20'
              }`}
            >
              Normal
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAlarm}
            className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
              alarmActive ? 'bg-amber-400 text-slate-900 animate-bounce' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {alarmActive ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span>{alarmActive ? 'Silenciar Sirena' : 'Activar Sirena Sonora'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
