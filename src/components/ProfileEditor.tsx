import React, { useState } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  User, 
  Phone, 
  ShieldAlert, 
  Activity, 
  Pill, 
  Home, 
  Heart, 
  Check, 
  Building2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { 
  MedicalProfile, 
  BloodType, 
  AllergyItem, 
  ConditionItem, 
  MedicationItem, 
  EmergencyContact, 
  AllergySeverity 
} from '../types/medical';

interface ProfileEditorProps {
  initialProfile: MedicalProfile;
  onSave: (updatedProfile: MedicalProfile) => void;
  onCancel: () => void;
}

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Desconocido'];

const COMMON_ALLERGIES = [
  'Penicilina / Amoxicilina',
  'AINEs (Ibuprofeno, Aspirina)',
  'Látex',
  'Frutos Secos / Cacahuates',
  'Mariscos / Crustáceos',
  'Picadura de Abeja / Avispa',
  'Sulfamidas',
  'Contraste Yodado',
];

const COMMON_CONDITIONS = [
  'Diabetes Tipo 1 (Insulinodependiente)',
  'Diabetes Tipo 2',
  'Hipertensión Arterial',
  'Asma Bronquial Severa',
  'Epilepsia / Convulsiones',
  'Portador de Marcapasos',
  'Cardiopatía Isquémica',
  'Tratamiento Anticoagulante (Sintrom/Warfarina)',
  'Insuficiencia Renal',
];

const COUNTRY_CODES = [
  { code: '+52', label: 'México (+52)' },
  { code: '+34', label: 'España (+34)' },
  { code: '+1', label: 'USA / Canadá (+1)' },
  { code: '+54', label: 'Argentina (+54)' },
  { code: '+57', label: 'Colombia (+57)' },
  { code: '+56', label: 'Chile (+56)' },
  { code: '+51', label: 'Perú (+51)' },
  { code: '+593', label: 'Ecuador (+593)' },
  { code: '+502', label: 'Guatemala (+502)' },
  { code: '+506', label: 'Costa Rica (+506)' },
  { code: '+598', label: 'Uruguay (+598)' },
  { code: '+44', label: 'Reino Unido (+44)' },
  { code: '+33', label: 'Francia (+33)' },
  { code: '+49', label: 'Alemania (+49)' },
  { code: '+39', label: 'Italia (+39)' },
];

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  initialProfile,
  onSave,
  onCancel,
}) => {
  const [profile, setProfile] = useState<MedicalProfile>(JSON.parse(JSON.stringify(initialProfile)));
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  // Contact Handlers
  const addContact = () => {
    const newContact: EmergencyContact = {
      id: `c_${Date.now()}`,
      name: '',
      relationship: 'Familiar',
      countryCode: '+52',
      phone: '',
      isPrimary: profile.emergencyContacts.length === 0,
      notifyViaWhatsApp: true,
    };
    setProfile(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact],
    }));
  };

  const removeContact = (id: string) => {
    setProfile(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(c => c.id !== id),
    }));
  };

  const updateContact = (id: string, patch: Partial<EmergencyContact>) => {
    setProfile(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...patch };
          // If set to primary, unset others
          if (patch.isPrimary) {
            // handle in separate map or next pass
          }
          return updated;
        }
        if (patch.isPrimary) {
          return { ...c, isPrimary: false };
        }
        return c;
      }),
    }));
  };

  // Allergy Handlers
  const addAllergy = (name = '', severity: AllergySeverity = 'Severa', notes = '') => {
    const newAllergy: AllergyItem = {
      id: `a_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      severity,
      notes,
    };
    setProfile(prev => ({
      ...prev,
      allergies: [...prev.allergies, newAllergy],
    }));
  };

  const removeAllergy = (id: string) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a.id !== id),
    }));
  };

  const updateAllergy = (id: string, patch: Partial<AllergyItem>) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.map(a => (a.id === id ? { ...a, ...patch } : a)),
    }));
  };

  // Condition Handlers
  const addCondition = (name = '', isChronic = true, notes = '') => {
    const newCond: ConditionItem = {
      id: `cond_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      isChronic,
      notes,
    };
    setProfile(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCond],
    }));
  };

  const removeCondition = (id: string) => {
    setProfile(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== id),
    }));
  };

  const updateCondition = (id: string, patch: Partial<ConditionItem>) => {
    setProfile(prev => ({
      ...prev,
      conditions: prev.conditions.map(c => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  // Medication Handlers
  const addMedication = () => {
    const newMed: MedicationItem = {
      id: `med_${Date.now()}`,
      name: '',
      dosage: '',
      frequency: '',
    };
    setProfile(prev => ({
      ...prev,
      medications: [...prev.medications, newMed],
    }));
  };

  const removeMedication = (id: string) => {
    setProfile(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id),
    }));
  };

  const updateMedication = (id: string, patch: Partial<MedicationItem>) => {
    setProfile(prev => ({
      ...prev,
      medications: prev.medications.map(m => (m.id === id ? { ...m, ...patch } : m)),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Title & Sticky Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-16 z-30">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Configuración del Perfil Médico de Emergencia
          </h1>
          <p className="text-xs text-slate-500">
            Todos los cambios se guardan localmente en tu navegador sin salir de tu dispositivo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer transition-transform active:scale-95"
          >
            {showSavedFeedback ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
            <span>{showSavedFeedback ? 'Guardado Exitosamente!' : 'Guardar Ficha'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PERSONAL & PHYSICAL DATA */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-red-600" />
          <h2 className="font-bold text-slate-900 text-base">Datos Personales y Fisiológicos</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              placeholder="Ej: Carlos Mendoza Silva"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Grupo Sanguíneo *
            </label>
            <select
              value={profile.bloodType}
              onChange={(e) => setProfile({ ...profile, bloodType: e.target.value as BloodType })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-bold bg-white"
            >
              {BLOOD_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={profile.birthDate || ''}
              onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Doc. de Identidad / DNI / Cédula
            </label>
            <input
              type="text"
              value={profile.documentId || ''}
              onChange={(e) => setProfile({ ...profile, documentId: e.target.value })}
              placeholder="Ej: 45892104-X"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-mono"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.isOrganDonor}
                onChange={(e) => setProfile({ ...profile, isOrganDonor: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-800">
                Donante de Órganos Voluntario
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Estatura (cm)
            </label>
            <input
              type="number"
              value={profile.heightCm || ''}
              onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) || undefined })}
              placeholder="175"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Peso (kg)
            </label>
            <input
              type="number"
              value={profile.weightKg || ''}
              onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) || undefined })}
              placeholder="70"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: RESIDENTIAL ADDRESS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Home className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-slate-900 text-base">Dirección y Residencia</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dirección de Domicilio Habitual
            </label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Calle, número, piso, puerta o localidad"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ciudad / País
            </label>
            <input
              type="text"
              value={profile.city || ''}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              placeholder="Ej: Madrid, España"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: EMERGENCY CONTACTS (ICE) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Contactos de Emergencia (Familiares Clave ICE)
              </h2>
              <p className="text-xs text-slate-500">
                Familiares y contactos clave disponibles para llamada directa en 1 clic al escanear tu código.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addContact}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs border border-red-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Familiar</span>
          </button>
        </div>

        <div className="space-y-3">
          {profile.emergencyContacts.map((contact, index) => (
            <div
              key={contact.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mamá (María)"
                  value={contact.name}
                  onChange={(e) => updateContact(contact.id, { name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Parentesco
                </label>
                <input
                  type="text"
                  placeholder="Ej: Madre, Pareja, Hijo"
                  value={contact.relationship}
                  onChange={(e) => updateContact(contact.id, { relationship: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Prefijo País
                </label>
                <select
                  value={contact.countryCode}
                  onChange={(e) => updateContact(contact.id, { countryCode: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Número Telefónico (Sin 52)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="5512345678"
                  value={contact.phone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\s+/g, '');
                    // Strip accidental +52 or leading 52 if followed by standard 10 digits
                    if (val.startsWith('+52')) val = val.slice(3);
                    else if (val.startsWith('52') && val.length > 10) val = val.slice(2);
                    updateContact(contact.id, { phone: val });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-4">
                <label className="flex items-center gap-1 cursor-pointer" title="Marcar como contacto principal">
                  <input
                    type="radio"
                    name="primary_contact_group"
                    checked={contact.isPrimary}
                    onChange={() => updateContact(contact.id, { isPrimary: true })}
                    className="text-red-600"
                  />
                  <span className="text-[11px] font-bold text-slate-700">Principal</span>
                </label>

                <button
                  type="button"
                  onClick={() => removeContact(contact.id)}
                  title="Eliminar contacto"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: ALLERGIES & ANAPHYLAXIS */}
      <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-base">Historial de Alergias</h2>
              <p className="text-xs text-slate-500">
                Alergias medicamentosas, alimentarias o ambientales y nivel de gravedad.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => addAllergy()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Alergia</span>
          </button>
        </div>

        {/* Suggestion Chips */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 block mb-1">
            Sugerencias rápidas para agregar en 1 clic:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_ALLERGIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => addAllergy(item, 'Crítica / Anafilaxia', 'Riesgo grave de choque anafiláctico')}
                className="text-[11px] font-medium bg-rose-50 text-rose-800 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 cursor-pointer"
              >
                + {item}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {profile.allergies.map((allergy) => (
            <div
              key={allergy.id}
              className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nombre de la Alergia
                </label>
                <input
                  type="text"
                  placeholder="Ej: Penicilina"
                  value={allergy.name}
                  onChange={(e) => updateAllergy(allergy.id, { name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Gravedad / Severidad
                </label>
                <select
                  value={allergy.severity}
                  onChange={(e) => updateAllergy(allergy.id, { severity: e.target.value as AllergySeverity })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Crítica / Anafilaxia">Crítica / Anafilaxia</option>
                  <option value="Severa">Severa</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Leve">Leve</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Reacción / Indicación
                </label>
                <input
                  type="text"
                  placeholder="Ej: Requiere epinefrina"
                  value={allergy.notes || ''}
                  onChange={(e) => updateAllergy(allergy.id, { notes: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeAllergy(allergy.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: CONDITIONS & CHRONIC DISEASES */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-base">Enfermedades y Padecimientos</h2>
              <p className="text-xs text-slate-500">
                Condiciones preexistentes indispensables para los paramédicos de urgencia.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => addCondition()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Padecimiento</span>
          </button>
        </div>

        {/* Suggestion Chips */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 block mb-1">
            Padecimientos frecuentes:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_CONDITIONS.map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => addCondition(cond, true, 'Control médico activo')}
                className="text-[11px] font-medium bg-slate-100 text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer"
              >
                + {cond}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {profile.conditions.map((condition) => (
            <div
              key={condition.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Enfermedad o Condición
                </label>
                <input
                  type="text"
                  placeholder="Ej: Diabetes Tipo 1"
                  value={condition.name}
                  onChange={(e) => updateCondition(condition.id, { name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Notas Clínicas / Protocolo
                </label>
                <input
                  type="text"
                  placeholder="Ej: En caso de desmayo medir glucosa"
                  value={condition.notes || ''}
                  onChange={(e) => updateCondition(condition.id, { notes: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 pt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={condition.isChronic}
                    onChange={(e) => updateCondition(condition.id, { isChronic: e.target.checked })}
                    className="text-indigo-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">Crónica</span>
                </label>
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeCondition(condition.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: MEDICATIONS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-base">Medicación Habitual</h2>
              <p className="text-xs text-slate-500">Medicamentos prescritos actuales y posología.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={addMedication}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-xs border border-teal-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Medicamento</span>
          </button>
        </div>

        <div className="space-y-3">
          {profile.medications.map((med) => (
            <div
              key={med.id}
              className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/30 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nombre del Fármaco
                </label>
                <input
                  type="text"
                  placeholder="Ej: Insulina Lispro"
                  value={med.name}
                  onChange={(e) => updateMedication(med.id, { name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Dosis
                </label>
                <input
                  type="text"
                  placeholder="Ej: 10 mg / 1 ampolla"
                  value={med.dosage || ''}
                  onChange={(e) => updateMedication(med.id, { dosage: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Frecuencia / Pauta
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cada 12h con comida"
                  value={med.frequency || ''}
                  onChange={(e) => updateMedication(med.id, { frequency: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeMedication(med.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 7: EMERGENCY NOTES & HOSPITAL */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileText className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-slate-900 text-base">Instrucciones Especiales & Cobertura Médica</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Instrucciones Inmediatas de Rescate (Aviso crítico para rescatistas)
            </label>
            <textarea
              rows={3}
              value={profile.specialInstructions || ''}
              onChange={(e) => setProfile({ ...profile, specialInstructions: e.target.value })}
              placeholder="Ej: Lleva glucagón en la mochila. En caso de ataque epiléptico colocar de lado y no introducir objetos en la boca."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Seguro Médico / Mutua / Cobertura
            </label>
            <input
              type="text"
              value={profile.healthInsurance || ''}
              onChange={(e) => setProfile({ ...profile, healthInsurance: e.target.value })}
              placeholder="Ej: Seguridad Social / Sanitas / Adeslas"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Número de Póliza / Afiliación
            </label>
            <input
              type="text"
              value={profile.insurancePolicyNumber || ''}
              onChange={(e) => setProfile({ ...profile, insurancePolicyNumber: e.target.value })}
              placeholder="Ej: POL-882319-X"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hospital o Centro de Referencia Preferido
            </label>
            <input
              type="text"
              value={profile.preferredHospital || ''}
              onChange={(e) => setProfile({ ...profile, preferredHospital: e.target.value })}
              placeholder="Ej: Hospital Universitario Central"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
        >
          <Save className="w-5 h-5" />
          <span>Guardar Cambios de la Ficha Médica</span>
        </button>
      </div>
    </form>
  );
};
