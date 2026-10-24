/**
 * Offline Audio Beacon using Web Audio API
 * Allows first responders or the user to sound an audible alarm
 * even with no internet connection.
 */

let audioCtx: AudioContext | null = null;
let isBeeping = false;
let timeoutId: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playEmergencyPulse(freq: number = 880, durationMs: number = 300) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + durationMs / 1000);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (err) {
    console.warn('Audio beacon error:', err);
  }
}

export function startSOSAlarm(onStateChange?: (active: boolean) => void) {
  if (isBeeping) return;
  isBeeping = true;
  if (onStateChange) onStateChange(true);

  let step = 0;
  const loop = () => {
    if (!isBeeping) return;
    // High alert dual tone (800Hz / 1200Hz)
    const freq = step % 2 === 0 ? 960 : 720;
    playEmergencyPulse(freq, 280);
    step++;
    timeoutId = window.setTimeout(loop, 400);
  };
  loop();
}

export function stopSOSAlarm(onStateChange?: (active: boolean) => void) {
  isBeeping = false;
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  if (onStateChange) onStateChange(false);
}

export function isAlarmRunning(): boolean {
  return isBeeping;
}
