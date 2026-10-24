import { MedicalProfile } from '../types/medical';
import { encryptData, decryptData, hashPin } from './crypto';

const STORAGE_KEY = 'sos_medical_profile_v2';
const PIN_HASH_KEY = 'sos_profile_pin_hash';
const ENCRYPTED_FLAG_KEY = 'sos_profile_is_encrypted';

export const DEFAULT_PROFILE: MedicalProfile = {
  id: 'profile_default_user',
  updatedAt: new Date().toISOString(),
  fullName: 'Carlos Mendoza Silva',
  birthDate: '1988-06-15',
  documentId: '45892104-X',
  bloodType: 'O+',
  isOrganDonor: true,
  heightCm: 178,
  weightKg: 75,
  address: 'Av. Siempre Viva 742, Depto 4B',
  city: 'Madrid / Ciudad de México',
  country: 'México',
  emergencyContacts: [
    {
      id: 'c1',
      name: 'María Silva (Madre)',
      relationship: 'Madre',
      countryCode: '+52',
      phone: '5512345678',
      isPrimary: true,
      notifyViaWhatsApp: true,
    },
    {
      id: 'c2',
      name: 'Alejandro Mendoza (Hermano)',
      relationship: 'Hermano',
      countryCode: '+52',
      phone: '5598765432',
      isPrimary: false,
      notifyViaWhatsApp: true,
    },
  ],
  allergies: [
    {
      id: 'a1',
      name: 'Penicilina / Amoxicilina',
      severity: 'Crítica / Anafilaxia',
      notes: 'Riesgo de shock anafiláctico inmediato. Requiere adrenalina.',
    },
    {
      id: 'a2',
      name: 'AINEs (Ibuprofeno, Aspirina)',
      severity: 'Severa',
      notes: 'Edema laríngeo e hipersensibilidad.',
    },
    {
      id: 'a3',
      name: 'Mariscos / Crustáceos',
      severity: 'Moderada',
      notes: 'Urticaria generalizada.',
    },
  ],
  conditions: [
    {
      id: 'con1',
      name: 'Diabetes Mellitus Tipo 1',
      isChronic: true,
      notes: 'Insulinodependiente. En hipoglucemia suministrar glucosa oral o glucagón.',
    },
    {
      id: 'con2',
      name: 'Hipertensión Arterial',
      isChronic: true,
      notes: 'Controlada con medicación matutina.',
    },
  ],
  medications: [
    {
      id: 'm1',
      name: 'Insulina Glargina',
      dosage: '22 UI',
      frequency: 'Cada 24 horas (Noche)',
    },
    {
      id: 'm2',
      name: 'Insulina Lispro',
      dosage: 'Según escala móvil',
      frequency: 'Antes de comidas',
    },
    {
      id: 'm3',
      name: 'Enalapril',
      dosage: '10 mg',
      frequency: 'Cada 12 horas',
    },
  ],
  specialInstructions: 'Lleva pluma de Glucagón de emergencia en el bolsillo exterior de su mochila. En caso de pérdida de conciencia, NO suministrar líquidos por la boca.',
  healthInsurance: 'Sanitas / Seguro Social',
  insurancePolicyNumber: 'POL-9923841-ES',
  preferredHospital: 'Hospital Universitario La Paz',
  isEncrypted: false,
  hasPinProtection: false,
  allowPublicAddressInQR: true,
  allowCompactOfflineMode: true,
};

export function getStoredPinHash(): string | null {
  return localStorage.getItem(PIN_HASH_KEY);
}

export async function setAppPin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
}

export function clearAppPin(): void {
  localStorage.removeItem(PIN_HASH_KEY);
}

export async function verifyAppPin(pin: string): Promise<boolean> {
  const stored = getStoredPinHash();
  if (!stored) return true;
  const hash = await hashPin(pin);
  return hash === stored;
}

export async function saveProfileToStorage(profile: MedicalProfile, encryptionPassword?: string): Promise<void> {
  profile.updatedAt = new Date().toISOString();
  if (encryptionPassword && profile.isEncrypted) {
    const json = JSON.stringify(profile);
    const encrypted = await encryptData(json, encryptionPassword);
    localStorage.setItem(STORAGE_KEY, encrypted);
    localStorage.setItem(ENCRYPTED_FLAG_KEY, 'true');
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(ENCRYPTED_FLAG_KEY, 'false');
  }
}

export async function loadProfileFromStorage(decryptionPassword?: string): Promise<{
  profile: MedicalProfile;
  isEncrypted: boolean;
  needsPassword: boolean;
}> {
  const raw = localStorage.getItem(STORAGE_KEY);
  const isEncrypted = localStorage.getItem(ENCRYPTED_FLAG_KEY) === 'true';

  if (!raw) {
    return {
      profile: DEFAULT_PROFILE,
      isEncrypted: false,
      needsPassword: false,
    };
  }

  if (isEncrypted) {
    if (!decryptionPassword) {
      return {
        profile: DEFAULT_PROFILE,
        isEncrypted: true,
        needsPassword: true,
      };
    }
    try {
      const decrypted = await decryptData(raw, decryptionPassword);
      const parsed = JSON.parse(decrypted) as MedicalProfile;
      return {
        profile: parsed,
        isEncrypted: true,
        needsPassword: false,
      };
    } catch {
      throw new Error('Contraseña o PIN incorrecto para descifrar la ficha.');
    }
  }

  try {
    const parsed = JSON.parse(raw) as MedicalProfile;
    return {
      profile: parsed,
      isEncrypted: false,
      needsPassword: false,
    };
  } catch {
    return {
      profile: DEFAULT_PROFILE,
      isEncrypted: false,
      needsPassword: false,
    };
  }
}

export function exportProfileAsJSON(profile: MedicalProfile): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `Ficha_Medica_SOS_${profile.fullName.replace(/\s+/g, '_')}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
