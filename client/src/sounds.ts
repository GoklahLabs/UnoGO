/**
 * Color Clash — Synthetic Sound Engine (Web Audio API)
 * No external files needed. All sounds are generated programmatically.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWindow = Window & { webkitAudioContext?: typeof AudioContext };

let _ctx: AudioContext | null = null;

function ctx(): AudioContext | null {
  try {
    if (!_ctx) {
      const W = window as AnyWindow;
      const AC = window.AudioContext || W.webkitAudioContext;
      if (!AC) return null;
      _ctx = new AC();
    }
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  startDelay = 0,
  freqEnd?: number,
) {
  const c = ctx();
  if (!c) return;
  const t = c.currentTime + startDelay;

  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.connect(gain);
  gain.connect(c.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 10), t + duration);
  }

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function noise(duration: number, volume = 0.1, startDelay = 0, cutoff = 2000) {
  const c = ctx();
  if (!c) return;
  const t = c.currentTime + startDelay;

  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(cutoff, t);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start(t);
  src.stop(t + duration);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public sound API
// ─────────────────────────────────────────────────────────────────────────────

export const sounds = {
  /** Played when any card is placed on the discard pile */
  card: () => {
    try {
      tone(1100, 0.06, 'triangle', 0.22, 0, 600);
      noise(0.08, 0.06, 0, 3000);
    } catch { /* ignore */ }
  },

  /** Played when drawing 1 card normally */
  draw: () => {
    try {
      noise(0.12, 0.12, 0, 1500);
      tone(280, 0.1, 'sine', 0.12, 0.02, 180);
    } catch { /* ignore */ }
  },

  /** Skip or Reverse card played */
  skip: () => {
    try {
      tone(700, 0.07, 'square', 0.18);
      tone(700, 0.07, 'square', 0.18, 0.09);
    } catch { /* ignore */ }
  },

  /** Wild card chosen */
  wild: () => {
    try {
      [500, 700, 900, 1100, 900, 700, 900].forEach((f, i) =>
        tone(f, 0.07, 'sine', 0.14, i * 0.042));
    } catch { /* ignore */ }
  },

  /** It's your turn */
  turn: () => {
    try {
      tone(660, 0.15, 'sine', 0.2);
      tone(880, 0.25, 'sine', 0.22, 0.12);
    } catch { /* ignore */ }
  },

  /** UNO button pressed */
  uno: () => {
    try {
      tone(600, 0.1, 'sine', 0.3);
      tone(800, 0.1, 'sine', 0.3, 0.09);
      tone(1050, 0.25, 'sine', 0.38, 0.18);
    } catch { /* ignore */ }
  },

  /** Drawing penalty (+2 or +4) */
  penalty: () => {
    try {
      tone(450, 0.14, 'triangle', 0.28);
      tone(330, 0.14, 'triangle', 0.28, 0.14);
      tone(220, 0.22, 'triangle', 0.24, 0.28);
      noise(0.18, 0.1, 0.02, 800);
    } catch { /* ignore */ }
  },

  /** Challenge UNO button pressed */
  challenge: () => {
    try {
      tone(900, 0.07, 'square', 0.22);
      tone(900, 0.07, 'square', 0.22, 0.1);
      tone(600, 0.18, 'square', 0.18, 0.2);
    } catch { /* ignore */ }
  },

  /** Victory */
  win: () => {
    try {
      [523, 659, 784, 1047, 1319].forEach((f, i) =>
        tone(f, 0.4, 'sine', 0.28, i * 0.11));
    } catch { /* ignore */ }
  },

  /** Lose */
  lose: () => {
    try {
      [440, 370, 330, 262].forEach((f, i) =>
        tone(f, 0.3, 'sine', 0.22, i * 0.12));
    } catch { /* ignore */ }
  },

  /** Error / invalid action */
  error: () => {
    try {
      tone(220, 0.06, 'square', 0.14);
      tone(160, 0.14, 'square', 0.12, 0.08);
    } catch { /* ignore */ }
  },

  /** Button click generic */
  click: () => {
    try {
      tone(1200, 0.04, 'triangle', 0.12, 0, 900);
    } catch { /* ignore */ }
  },
};
