import QRCode from 'qrcode';
import { MedicalProfile } from '../types/medical';
import { formatQuickCallDisplayNumber } from './emergencyAlert';

export async function generateQRDataUrl(
  text: string,
  options?: {
    colorDark?: string;
    colorLight?: string;
    width?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    margin?: number;
  }
): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
    margin: options?.margin !== undefined ? options.margin : 3, // Quiet zone of 3-4 modules required for rapid camera detection
    width: options?.width || 360,
    color: {
      dark: options?.colorDark || '#000000',
      light: options?.colorLight || '#ffffff',
    },
  });
}

/**
 * Creates an ultra-sharp downloadable Wallet Emergency Card (Credit Card Format)
 */
export async function generateWalletCardImage(
  profile: MedicalProfile,
  qrDataUrl: string
): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 1050; // High resolution ~300 DPI for standard 85.6mm card
  const height = 660; // 53.98mm
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - Clean crisp medical gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#ffffff');
  bgGrad.addColorStop(1, '#f8fafc');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Border & Header Bar (Emergency Red)
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#dc2626';
  ctx.strokeRect(10, 10, width - 20, height - 20);

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(10, 10, width - 20, 95);

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('🚨 TARJETA MÉDICA DE EMERGENCIA - SOS', 40, 68);

  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('ICE / ESCANEE EN CASO DE AUXILIO', width - 420, 68);

  // QR Code Image placement on the right
  const qrImg = new Image();
  qrImg.src = qrDataUrl;
  await new Promise((res) => {
    qrImg.onload = res;
  });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(width - 310, 130, 270, 270);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 3;
  ctx.strokeRect(width - 310, 130, 270, 270);
  ctx.drawImage(qrImg, width - 300, 140, 250, 250);

  // QR Label
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ESCANEAR CON CÁMARA', width - 175, 428);
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Abre Ficha Médica SOS', width - 175, 448);
  ctx.textAlign = 'left';

  // Left Side: Patient details
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(profile.fullName, 45, 160);

  // Blood group badge
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.roundRect(45, 180, 160, 48, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`SANGRE: ${profile.bloodType}`, 58, 213);

  // Organ donor pill
  if (profile.isOrganDonor) {
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(220, 180, 180, 48, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DONANTE: SÍ', 242, 212);
  }

  // Critical Allergies
  ctx.fillStyle = '#991b1b';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('⚠️ ALERGIAS CRÍTICAS:', 45, 270);
  ctx.fillStyle = '#1e293b';
  ctx.font = '500 19px "Plus Jakarta Sans", sans-serif';
  const allergiesStr = profile.allergies.length > 0
    ? profile.allergies.map(a => `${a.name} (${a.severity})`).join(', ')
    : 'Sin alergias conocidas';
  ctx.fillText(allergiesStr.slice(0, 65) + (allergiesStr.length > 65 ? '...' : ''), 45, 300);

  // Chronic Conditions
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('📋 PADECIMIENTOS:', 45, 345);
  ctx.fillStyle = '#1e293b';
  ctx.font = '500 19px "Plus Jakarta Sans", sans-serif';
  const conditionsStr = profile.conditions.length > 0
    ? profile.conditions.map(c => c.name).join(', ')
    : 'Ninguno reportado';
  ctx.fillText(conditionsStr.slice(0, 65) + (conditionsStr.length > 65 ? '...' : ''), 45, 375);

  // ICE Contacts
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('📞 CONTACTOS DE EMERGENCIA (ICE):', 45, 425);
  
  ctx.font = '600 19px "JetBrains Mono", monospace';
  ctx.fillStyle = '#047857';
  if (profile.emergencyContacts.length > 0) {
    const c1 = profile.emergencyContacts[0];
    ctx.fillText(`1. ${c1.name} (${c1.relationship}): ${formatQuickCallDisplayNumber(c1.countryCode, c1.phone)}`, 45, 455);
    if (profile.emergencyContacts.length > 1) {
      const c2 = profile.emergencyContacts[1];
      ctx.fillText(`2. ${c2.name} (${c2.relationship}): ${formatQuickCallDisplayNumber(c2.countryCode, c2.phone)}`, 45, 485);
    }
  }

  // Footer bar with address & emergency note
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(10, height - 100, width - 20, 90);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`DIRECCIÓN: ${profile.address || 'No especificada'}`, 45, height - 65);
  if (profile.specialInstructions) {
    ctx.font = 'italic 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText(`NOTA SOS: ${profile.specialInstructions.slice(0, 95)}`, 45, height - 35);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Creates an Android Lockscreen Wallpaper (1080x2400 AMOLED dark theme)
 * Designed for Android devices so paramedics can scan the QR directly from the lock screen.
 */
export async function generateLockscreenWallpaper(
  profile: MedicalProfile,
  qrDataUrl: string
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 2400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Dark AMOLED slate background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Red accent top banner
  const topGrad = ctx.createLinearGradient(0, 0, 0, 320);
  topGrad.addColorStop(0, '#dc2626');
  topGrad.addColorStop(1, '#991b1b');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, canvas.width, 320);

  // Clock space guide
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🚨 INFORMACIÓN MÉDICA SOS', canvas.width / 2, 170);

  ctx.font = 'bold 26px "JetBrains Mono", monospace';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('IN CASO DE EMERGENCIA - ESCANEAR QR', canvas.width / 2, 230);

  // Profile Card in the middle
  const cardY = 480;
  ctx.fillStyle = '#131b2e';
  ctx.beginPath();
  ctx.roundRect(80, cardY, canvas.width - 160, 1580, 32);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#334155';
  ctx.stroke();

  // Patient Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(profile.fullName, canvas.width / 2, cardY + 90);

  // Blood group pill
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(canvas.width / 2 - 200, cardY + 125, 400, 70, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`SANGRE: ${profile.bloodType}`, canvas.width / 2, cardY + 172);

  // QR Code Frame
  const qrSize = 580;
  const qrX = (canvas.width - qrSize) / 2;
  const qrY = cardY + 230;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 24);
  ctx.fill();

  const qrImg = new Image();
  qrImg.src = qrDataUrl;
  await new Promise((res) => {
    qrImg.onload = res;
  });
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // Scanner instruction
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('📸 Escanee para Ficha Médica & Llamada ICE', canvas.width / 2, qrY + qrSize + 70);

  // ICE Contacts
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CONTACTOS DE URGENCIA (ICE):', canvas.width / 2, qrY + qrSize + 130);

  if (profile.emergencyContacts.length > 0) {
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 32px "JetBrains Mono", monospace';
    const c1 = profile.emergencyContacts[0];
    ctx.fillText(`${c1.name}: ${formatQuickCallDisplayNumber(c1.countryCode, c1.phone)}`, canvas.width / 2, qrY + qrSize + 180);

    if (profile.emergencyContacts.length > 1) {
      const c2 = profile.emergencyContacts[1];
      ctx.fillText(`${c2.name}: ${formatQuickCallDisplayNumber(c2.countryCode, c2.phone)}`, canvas.width / 2, qrY + qrSize + 230);
    }
  }

  // Critical Allergies
  if (profile.allergies.length > 0) {
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('⚠️ ALERGIAS CRÍTICAS:', canvas.width / 2, qrY + qrSize + 300);
    ctx.fillStyle = '#ffffff';
    ctx.font = '26px "Plus Jakarta Sans", sans-serif';
    const allTxt = profile.allergies.map(a => a.name).join(' • ');
    ctx.fillText(allTxt.slice(0, 48), canvas.width / 2, qrY + qrSize + 345);
  }

  // Footer instructions
  ctx.fillStyle = '#64748b';
  ctx.font = '22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Establecer esta imagen como Fondo de Pantalla de Bloqueo', canvas.width / 2, canvas.height - 100);

  return canvas.toDataURL('image/png');
}

/**
 * Creates an ultra-compact sticker specifically formatted for Motorcycle Helmets, Bikes, and Moto fairings (40mm - 50mm vinyl format)
 * High contrast, scratch-resistant styling with prominent Blood Type and QR.
 */
export async function generateHelmetStickerImage(
  profile: MedicalProfile,
  qrDataUrl: string,
  variant: 'square' | 'dark' = 'square'
): Promise<string> {
  const canvas = document.createElement('canvas');
  // High resolution square 600x600 px (~50mm at 300DPI)
  const size = 600;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const isDark = variant === 'dark';

  // Outer border & background (weatherproof vinyl style)
  ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
  ctx.beginPath();
  ctx.roundRect(10, 10, size - 20, size - 20, 36);
  ctx.fill();

  // Emergency safety border (Red + reflective yellow accent)
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#dc2626';
  ctx.stroke();

  // Inner subtle neon yellow rim
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#eab308';
  ctx.strokeRect(20, 20, size - 40, size - 40);

  // Top Red Emergency Bar
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(18, 18, size - 36, 80, [26, 26, 0, 0]);
  ctx.fill();

  // Top Header Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🚨 SOS MÉDICO • CASCO / MOTO', size / 2, 54);

  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('ESCANEAR EN ACCIDENTE', size / 2, 82);

  // Large QR Code in the center
  const qrSize = 310;
  const qrX = (size - qrSize) / 2;
  const qrY = 115;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 16);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  const qrImg = new Image();
  qrImg.src = qrDataUrl;
  await new Promise((res) => {
    qrImg.onload = res;
  });
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // Blood group & Emergency Info Banner below QR
  const infoY = 445;

  // Blood Group Pill
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(26, infoY, 210, 52, 12);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`SANGRE: ${profile.bloodType}`, 131, infoY + 36);

  // ICE Contact Pill
  const primaryContact = profile.emergencyContacts.find(c => c.isPrimary) || profile.emergencyContacts[0];
  ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
  ctx.beginPath();
  ctx.roundRect(246, infoY, size - 272, 52, 12);
  ctx.fill();
  ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = isDark ? '#38bdf8' : '#0369a1';
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  const phoneText = primaryContact ? `ICE: ${formatQuickCallDisplayNumber(primaryContact.countryCode, primaryContact.phone)}` : 'ICE: 911';
  ctx.fillText(phoneText, 246 + (size - 272) / 2, infoY + 34);

  // Bottom subtitle: Patient name & instruction
  ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(profile.fullName.toUpperCase(), size / 2, infoY + 84);

  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = isDark ? '#64748b' : '#64748b';
  ctx.fillText('Llamada en 1 Clic & Ficha Médica SOS', size / 2, infoY + 112);

  return canvas.toDataURL('image/png');
}

