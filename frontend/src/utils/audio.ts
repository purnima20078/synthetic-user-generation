/**
 * Synthesizes a pleasant research notification chime using Web Audio API.
 * No external CDN or file assets required. Respects browser autoplay policy
 * and user preferences.
 */

let audioCtx: AudioContext | null = null;
let isUnlocked = false;

export function unlockAudio() {
  if (isUnlocked && audioCtx && audioCtx.state === 'running') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    isUnlocked = true;
  } catch (err) {
    console.warn('Audio unlock warning:', err);
  }
}

// Attach auto-unlock to first window click/keydown
if (typeof window !== 'undefined') {
  const handleInteraction = () => {
    unlockAudio();
    window.removeEventListener('click', handleInteraction);
    window.removeEventListener('keydown', handleInteraction);
    window.removeEventListener('touchstart', handleInteraction);
  };
  window.addEventListener('click', handleInteraction, { passive: true });
  window.addEventListener('keydown', handleInteraction, { passive: true });
  window.addEventListener('touchstart', handleInteraction, { passive: true });
}

export function playNotificationChime(soundEnabled = true) {
  if (!soundEnabled) return;
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const ctx = audioCtx;
    const now = ctx.currentTime;

    // Harmonious research completion chord: C5, E5, G5, C6
    const frequencies = [523.25, 659.25, 783.99, 1046.5];
    const delays = [0, 0.07, 0.14, 0.22];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delays[idx]);

      // Audible, gentle bell envelope
      gain.gain.setValueAtTime(0.0001, now + delays[idx]);
      gain.gain.exponentialRampToValueAtTime(0.22, now + delays[idx] + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delays[idx] + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delays[idx]);
      osc.stop(now + delays[idx] + 0.9);
    });
  } catch (err) {
    console.warn('Notification audio playback error:', err);
  }
}

/**
 * High-clarity completion alert sound designed specifically for when
 * synthetic personas cohort generation finishes. Plays a bright, vibrant
 * chime alert that cuts cleanly through background tasks.
 */
export function playAlertSound(soundEnabled = true) {
  if (!soundEnabled) return;
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const ctx = audioCtx;
    const now = ctx.currentTime;

    // Bright 3-tone energetic completion chime: D5 -> A5 -> D6 with shimmer accent
    const notes = [
      { freq: 587.33, delay: 0.0, dur: 0.5, gain: 0.25 },
      { freq: 880.0, delay: 0.1, dur: 0.6, gain: 0.28 },
      { freq: 1174.66, delay: 0.2, dur: 1.1, gain: 0.32 },
      { freq: 1760.0, delay: 0.22, dur: 0.9, gain: 0.15 }, // sparkle harmonic
    ];

    notes.forEach(({ freq, delay, dur, gain: peakGain }) => {
      // Primary sine oscillator for pure tone
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      const startTime = now + delay;
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);

      // Add gentle harmonic warmth
      const overtoneOsc = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtoneOsc.type = 'triangle';
      overtoneOsc.frequency.setValueAtTime(freq * 1.5, startTime);

      overtoneGain.gain.setValueAtTime(0.0001, startTime);
      overtoneGain.gain.exponentialRampToValueAtTime(peakGain * 0.2, startTime + 0.015);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + (dur * 0.6));

      overtoneOsc.connect(overtoneGain);
      overtoneGain.connect(ctx.destination);

      overtoneOsc.start(startTime);
      overtoneOsc.stop(startTime + dur * 0.65);
    });

    console.log('[Audio] Synthetic Persona completion alert sound played successfully.');
  } catch (err) {
    console.warn('Alert sound playback failed:', err);
  }
}

