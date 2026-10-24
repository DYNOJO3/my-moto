export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Desconocido';

export type AllergySeverity = 'Crítica / Anafilaxia' | 'Severa' | 'Moderada' | 'Leve';

export interface AllergyItem {
  id: string;
  name: string;
  severity: AllergySeverity;
  notes?: string;
}

export interface ConditionItem {
  id: string;
  name: string;
  isChronic: boolean;
  notes?: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  countryCode: string; // e.g. "+34", "+52", "+1", "+54", "+57"
  isPrimary: boolean;
  notifyViaWhatsApp: boolean;
}

export interface MedicalProfile {
  id: string;
  updatedAt: string;
  // Personal Info
  fullName: string;
  birthDate?: string;
  documentId?: string; // DNI / Cédula / Pasaporte (opcional)
  bloodType: BloodType;
  isOrganDonor: boolean;
  heightCm?: number;
  weightKg?: number;
  
  // Location & Address
  address: string;
  city?: string;
  country?: string;

  // Contacts
  emergencyContacts: EmergencyContact[];

  // Medical specifics
  allergies: AllergyItem[];
  conditions: ConditionItem[];
  medications: MedicationItem[];

  // Additional instructions for paramedics
  specialInstructions?: string;
  healthInsurance?: string;
  insurancePolicyNumber?: string;
  preferredHospital?: string;

  // Security & Privacy preferences
  isEncrypted: boolean;
  hasPinProtection: boolean;
  allowPublicAddressInQR: boolean;
  allowCompactOfflineMode: boolean;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  mapsUrl: string;
  addressApprox?: string;
}
