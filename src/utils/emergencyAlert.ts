import { MedicalProfile, GPSLocation, EmergencyContact } from '../types/medical';

export function getCleanPhoneNumber(countryCode: string, phone: string): string {
  const combined = `${countryCode}${phone}`;
  // Keep only digits
  return combined.replace(/[^0-9]/g, '');
}

/**
 * Sanitizes phone number for quick call (tel: dialer):
 * Strips '52' / '+52' so Mexican 10-digit numbers dial cleanly
 * without country code 52, as requested by the user.
 */
export function getQuickCallPhoneNumber(countryCode: string = '', phone: string = ''): string {
  const cleanCC = (countryCode || '').replace(/[^0-9]/g, '');
  let cleanNumber = (phone || '').replace(/[^0-9]/g, '');

  // If phone already starts with 52 and has 12 digits (52 + 10-digit local number), strip 52
  if (cleanNumber.startsWith('52') && cleanNumber.length === 12) {
    cleanNumber = cleanNumber.slice(2);
  }

  // If Mexican country code (52) or empty with 10 digits
  if (cleanCC === '52' || cleanCC === '') {
    // If it still starts with 52 and has 12 digits, strip it
    if (cleanNumber.startsWith('52') && cleanNumber.length >= 12) {
      cleanNumber = cleanNumber.slice(2);
    }
    // Also remove old Mexican mobile carrier prefix '1' if 11 digits (e.g., 1 + 10 digits)
    if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
      cleanNumber = cleanNumber.slice(1);
    }
    return cleanNumber;
  }

  // For other international country codes
  if (cleanCC && cleanCC !== '52') {
    return `+${cleanCC}${cleanNumber}`;
  }

  return cleanNumber;
}

/**
 * Formats phone number for display in the quick call interface without '52' or '+52':
 * E.g., for Mexico: '55 1234 5678'
 */
export function formatQuickCallDisplayNumber(countryCode: string = '', phone: string = ''): string {
  const cleanNumber = getQuickCallPhoneNumber(countryCode, phone);

  // If standard 10-digit national number, display in clean 2-4-4 spacing
  if (cleanNumber.length === 10) {
    return `${cleanNumber.slice(0, 2)} ${cleanNumber.slice(2, 6)} ${cleanNumber.slice(6)}`;
  }

  // For 9-digit or other format
  if (cleanNumber.length === 9) {
    return `${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3, 6)} ${cleanNumber.slice(6)}`;
  }

  return cleanNumber;
}

export async function getCurrentGPSLocation(): Promise<GPSLocation> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('La geolocalización no está disponible en este dispositivo.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy);
        const timestamp = position.timestamp || Date.now();
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

        resolve({
          latitude: lat,
          longitude: lng,
          accuracy,
          timestamp,
          mapsUrl,
        });
      },
      (error) => {
        let msg = 'No se pudo obtener la ubicación GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permiso de ubicación denegado por el usuario o navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Ubicación GPS no disponible en este momento.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Tiempo de espera agotado al consultar el sensor GPS.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  });
}

export function buildWhatsAppEmergencyAlert(
  profile: MedicalProfile,
  contact: EmergencyContact,
  location?: GPSLocation | null
): { url: string; messageText: string } {
  const cleanPhone = getCleanPhoneNumber(contact.countryCode, contact.phone);

  const allergiesText = profile.allergies.length > 0
    ? profile.allergies.map(a => `${a.name} (${a.severity})`).join(', ')
    : 'Ninguna conocida';

  const conditionsText = profile.conditions.length > 0
    ? profile.conditions.map(c => c.name).join(', ')
    : 'Ninguna reportada';

  let locationText = '📍 Ubicación: No disponible (sin permiso o sin señal GPS)';
  if (location) {
    const timeStr = new Date(location.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    locationText = `📍 *UBICACIÓN EXACTA DEL PACIENTE (GPS):*\n${location.mapsUrl}\n(Coordenadas: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)} | Precisión: ±${location.accuracy}m | Hora: ${timeStr})`;
  }

  const messageText = 
`🚨 *ALERTA MÉDICA DE EMERGENCIA SOS* 🚨

Hola ${contact.name}, se ha escaneado la ficha médica de emergencia de:
👤 *${profile.fullName}*
🩸 *Grupo Sanguíneo:* ${profile.bloodType}

${locationText}

⚠️ *DATOS MÉDICOS CRÍTICOS:*
• Alergias: ${allergiesText}
• Condiciones: ${conditionsText}
${profile.address ? `🏠 Dirección registrada: ${profile.address}` : ''}
${profile.specialInstructions ? `ℹ️ Nota de emergencia: ${profile.specialInstructions}` : ''}

_Mensaje generado automáticamente mediante el Sistema QR SOS Médico._`;

  const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;

  return { url, messageText };
}

export function buildCompactOfflineText(profile: MedicalProfile): string {
  const lines: string[] = [
    '🚨 EMERGENCIA MÉDICA SOS 🚨',
    `PACIENTE: ${profile.fullName.toUpperCase()}`,
    `SANGRE: ${profile.bloodType} | DONANTE: ${profile.isOrganDonor ? 'SÍ' : 'NO'}`,
  ];

  if (profile.emergencyContacts.length > 0) {
    lines.push('CONTACTOS DE EMERGENCIA (ICE):');
    profile.emergencyContacts.forEach((c, idx) => {
      lines.push(`${idx + 1}. ${c.name} (${c.relationship}): ${formatQuickCallDisplayNumber(c.countryCode, c.phone)}`);
    });
  }

  if (profile.allergies.length > 0) {
    lines.push('ALERGIAS CRÍTICAS:');
    profile.allergies.forEach((a) => {
      lines.push(`• ${a.name} [${a.severity}]`);
    });
  } else {
    lines.push('ALERGIAS: Ninguna conocida');
  }

  if (profile.conditions.length > 0) {
    lines.push('PADECIMIENTOS / ENFERMEDADES:');
    profile.conditions.forEach((c) => {
      lines.push(`• ${c.name}`);
    });
  }

  if (profile.medications.length > 0) {
    lines.push('MEDICACIÓN HABITUAL:');
    profile.medications.forEach((m) => {
      lines.push(`• ${m.name}${m.dosage ? ` (${m.dosage})` : ''}`);
    });
  }

  if (profile.address && profile.allowPublicAddressInQR) {
    lines.push(`DIRECCIÓN: ${profile.address}`);
  }

  if (profile.specialInstructions) {
    lines.push(`INSTRUCCIONES: ${profile.specialInstructions}`);
  }

  return lines.join('\n');
}

export function buildVCardPayload(profile: MedicalProfile): string {
  const primaryContact = profile.emergencyContacts.find(c => c.isPrimary) || profile.emergencyContacts[0];
  const allergies = profile.allergies.map(a => a.name).join(', ') || 'Ninguna';
  const conditions = profile.conditions.map(c => c.name).join(', ') || 'Ninguna';

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:SOS - ${profile.fullName} (ICE)`,
    `N:;SOS - ${profile.fullName} (ICE);;;`,
    primaryContact ? `TEL;TYPE=CELL,VOICE:${getQuickCallPhoneNumber(primaryContact.countryCode, primaryContact.phone)}` : '',
    `NOTE:Sangre: ${profile.bloodType} | Alergias: ${allergies} | Padecimientos: ${conditions}`,
    profile.address ? `ADR;TYPE=HOME:;;${profile.address};;;;` : '',
    'END:VCARD'
  ].filter(Boolean).join('\n');
}
