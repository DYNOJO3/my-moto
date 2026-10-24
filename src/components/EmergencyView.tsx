import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  Heart, 
  Activity, 
  Pill, 
  ShieldAlert, 
  Info, 
  Home, 
  Building2,
  Volume2,
  VolumeX,
  Share2,
  Printer
} from 'lucide-react';
import { MedicalProfile, EmergencyContact } from '../types/medical';
import { getCleanPhoneNumber, getQuickCallPhoneNumber, formatQuickCallDisplayNumber } from '../utils/emergencyAlert';
import { isAlarmRunning, startSOSAlarm, stopSOSAlarm } from '../utils/audioAlert';

interface EmergencyViewProps {
  profile: MedicalProfile;
  isScannedView?: boolean;
  onEditProfile: () => void;
  onOpenStrobe: () => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  profile,
  isScannedView = false,
  onEditProfile,
  onOpenStrobe,
}) => {
  const [alarmActive, setAlarmActive] = useState<boolean>(isAlarmRunning());
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const toggleAlarm = () => {
    if (alarmActive) {
      stopSOSAlarm((active) => setAlarmActive(active));
    } else {
      startSOSAlarm((active) => setAlarmActive(active));
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ficha Médica SOS - ${profile.fullName}`,
          text: `Ficha médica de emergencia de ${profile.fullName}. Grupo: ${profile.bloodType}.`,
          url,
        });
      } catch {
        // user dismissed
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* Emergency Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl p-5 text-white shadow-xl shadow-red-600/20 border-2 border-red-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-950/40 text-red-100 text-xs font-bold uppercase tracking-wider border border-red-400/30">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              Ficha Médica de Rescate Activa
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile.fullName}
            </h1>
            <p className="text-sm text-red-100 flex items-center gap-2 flex-wrap">
              <span>{profile.city || profile.country || 'Datos de Rescate'}</span>
              {profile.documentId && (
                <>
                  <span>•</span>
                  <span>Doc: {profile.documentId}</span>
                </>
              )}
              {profile.birthDate && (
                <>
                  <span>•</span>
                  <span>Nacimiento: {profile.birthDate}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={toggleAlarm}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                alarmActive
                  ? 'bg-amber-400 text-slate-900 animate-bounce'
                  : 'bg-red-800 hover:bg-red-900 text-white'
              }`}
            >
              {alarmActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{alarmActive ? 'Silenciar Sirena' : 'Sirena SOS'}</span>
            </button>

            <button
              onClick={onOpenStrobe}
              className="px-3 py-2 rounded-xl bg-red-950/50 hover:bg-red-950 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-red-400/40 cursor-pointer"
            >
              <span>🚨 Linterna SOS</span>
            </button>

            <button
              onClick={() => window.print()}
              title="Imprimir ficha de emergencia"
              className="p-2 rounded-xl bg-red-950/50 hover:bg-red-950 text-white border border-red-400/40 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              title="Compartir enlace SOS"
              className="p-2 rounded-xl bg-red-950/50 hover:bg-red-950 text-white border border-red-400/40 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {copiedLink && (
          <div className="mt-2 text-xs bg-black/40 px-3 py-1 rounded inline-block text-amber-200">
            ✓ Enlace de emergencia copiado al portapapeles
          </div>
        )}
      </div>

      {/* EMERGENCY CONTACTS LIST (ICE) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-600" />
            <h2 className="font-extrabold text-slate-900 text-lg">
              Contactos Familiares de Emergencia (ICE)
            </h2>
          </div>
          <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
            {profile.emergencyContacts.length} Registrados
          </span>
        </div>

        {profile.emergencyContacts.length === 0 ? (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm">
            No se han registrado contactos de emergencia aún. Configure al menos uno para habilitar llamadas de auxilio.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.emergencyContacts.map((contact) => {
              const quickPhone = getQuickCallPhoneNumber(contact.countryCode, contact.phone);
              const displayPhone = formatQuickCallDisplayNumber(contact.countryCode, contact.phone);

              return (
                <div
                  key={contact.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    contact.isPrimary
                      ? 'border-red-400 bg-red-50/70 shadow-md'
                      : 'border-slate-200 bg-slate-50/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-base">{contact.name}</span>
                        {contact.isPrimary && (
                          <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                            PRINCIPAL ICE
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {contact.relationship}
                      </span>
                    </div>

                    {/* Direct Clickable Phone Badge (No 52) */}
                    <a
                      href={`tel:${quickPhone}`}
                      title="Toca para llamada rápida directa"
                      className="font-mono font-black text-sm text-red-700 bg-white px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                      <span>{displayPhone}</span>
                    </a>
                  </div>

                  {/* 1-Tap Direct Quick Call (No 52) */}
                  <div className="mt-3">
                    <a
                      href={`tel:${quickPhone}`}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
                    >
                      <Phone className="w-4 h-4 animate-bounce" />
                      <span>LLAMAR A {contact.name.toUpperCase()} (1 CLIC)</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CRITICAL MEDICAL TRIAGE GRID: BLOOD GROUP & ALLERGIES & CONDITIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Blood Type Card */}
        <div className="bg-red-600 text-white rounded-2xl p-5 shadow-lg shadow-red-600/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-200">
                GRUPO SANGUÍNEO
              </span>
              <Heart className="w-5 h-5 text-red-200" />
            </div>
            <div className="my-3">
              <span className="text-5xl font-black font-mono tracking-tight drop-shadow-sm">
                {profile.bloodType}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-red-500/60 flex items-center justify-between text-xs font-semibold">
            <span>Donante de Órganos:</span>
            <span className={`px-2 py-0.5 rounded-full font-bold ${profile.isOrganDonor ? 'bg-emerald-400 text-slate-900' : 'bg-red-950/40 text-red-100'}`}>
              {profile.isOrganDonor ? '✓ SÍ (REGISTRADO)' : 'NO ESPECIFICADO'}
            </span>
          </div>
        </div>

        {/* Height & Weight / Physical */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              DATOS FÍSICOS
            </span>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="my-2 grid grid-cols-2 gap-3">
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 block">Estatura</span>
              <span className="text-xl font-bold font-mono">
                {profile.heightCm ? `${profile.heightCm} cm` : '---'}
              </span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 block">Peso</span>
              <span className="text-xl font-bold font-mono">
                {profile.weightKg ? `${profile.weightKg} kg` : '---'}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
            Hospital Pref: <span className="text-white font-medium">{profile.preferredHospital || 'Cercano de Urgencias'}</span>
          </div>
        </div>

        {/* Health Insurance */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              SEGURO / COBERTURA
            </span>
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="my-2 space-y-1">
            <span className="text-xs text-slate-400 block">Compañía / Entidad:</span>
            <p className="text-lg font-bold text-white truncate">
              {profile.healthInsurance || 'Seguridad Social Pública'}
            </p>
            {profile.insurancePolicyNumber && (
              <p className="text-xs font-mono text-cyan-300">
                Póliza: {profile.insurancePolicyNumber}
              </p>
            )}
          </div>

          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
            Documento: <span className="text-white font-mono">{profile.documentId || 'No asignado'}</span>
          </div>
        </div>
      </div>

      {/* ALLERGIES WARNING SECTION */}
      <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-700" />
            <h2 className="font-extrabold text-rose-950 text-lg">
              Historial de Alergias Relevante
            </h2>
          </div>
          <span className="text-xs font-extrabold bg-rose-200 text-rose-900 px-2.5 py-1 rounded-full uppercase">
            Atención Rescatistas
          </span>
        </div>

        {profile.allergies.length === 0 ? (
          <p className="text-sm text-slate-600 bg-white/60 p-3 rounded-xl border border-rose-200">
            ✓ No se han reportado alergias medicamentosas ni alimentarias graves.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.allergies.map((allergy) => (
              <div
                key={allergy.id}
                className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 text-base">{allergy.name}</span>
                    <span
                      className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                        allergy.severity === 'Crítica / Anafilaxia'
                          ? 'bg-red-600 text-white animate-pulse'
                          : allergy.severity === 'Severa'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {allergy.severity}
                    </span>
                  </div>
                  {allergy.notes && (
                    <p className="text-xs text-rose-900 mt-1.5 font-medium leading-relaxed">
                      ⚠️ {allergy.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DISEASES & CHRONIC CONDITIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h2 className="font-extrabold text-slate-900 text-lg">
            Enfermedades y Padecimientos Actuales
          </h2>
        </div>

        {profile.conditions.length === 0 ? (
          <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl">
            No se han registrado padecimientos médicos crónicos.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.conditions.map((cond) => (
              <div
                key={cond.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-base">{cond.name}</span>
                    {cond.isChronic && (
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                        CRÓNICA
                      </span>
                    )}
                  </div>
                  {cond.notes && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {cond.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MEDICATIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Pill className="w-5 h-5 text-teal-600" />
          <h2 className="font-extrabold text-slate-900 text-lg">
            Medicación Habitual
          </h2>
        </div>

        {profile.medications.length === 0 ? (
          <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl">
            No se han indicado medicamentos prescritos en curso.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profile.medications.map((med) => (
              <div
                key={med.id}
                className="bg-teal-50/50 p-3.5 rounded-xl border border-teal-200/70"
              >
                <span className="font-bold text-slate-900 block text-sm">{med.name}</span>
                {med.dosage && (
                  <span className="text-xs font-semibold text-teal-800 block mt-0.5">
                    Dosis: {med.dosage}
                  </span>
                )}
                {med.frequency && (
                  <span className="text-[11px] text-slate-500 block">
                    Frecuencia: {med.frequency}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HOME ADDRESS & SPECIAL INSTRUCTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Address */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Home className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-base">Dirección de Domicilio</h3>
          </div>
          <p className="text-sm text-slate-700 font-medium">
            {profile.address || 'No se ha indicado dirección particular.'}
          </p>
          {(profile.city || profile.country) && (
            <p className="text-xs text-slate-500 mt-1">
              {[profile.city, profile.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        {/* Special Instructions */}
        <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-amber-950 text-base">Instrucciones Especiales SOS</h3>
          </div>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
            {profile.specialInstructions || 'Sin instrucciones adicionales de primeros auxilios.'}
          </p>
        </div>
      </div>

      {/* Bottom Profile Administration Bar */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <span>Última actualización médica: </span>
          <span className="font-medium text-slate-700">
            {new Date(profile.updatedAt).toLocaleDateString()} {new Date(profile.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <button
          onClick={onEditProfile}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer transition-colors"
        >
          ✏️ Editar Mi Ficha Médica
        </button>
      </div>
    </div>
  );
};
