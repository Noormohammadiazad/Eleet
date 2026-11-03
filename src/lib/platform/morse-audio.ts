/**
 * Morse transmitter: plays a keying schedule through the Web Audio API with a
 * clean sine tone (5 ms raised-cosine edges to avoid key clicks), drives a
 * signal-lamp callback in sync with the audio clock, and renders the same
 * schedule offline to a 16-bit PCM WAV file.
 */
import { morseSchedule, type MorseEvent } from '$engine/transforms/codes/morse';

export interface ToneOptions {
  readonly wpm: number;
  readonly effectiveWpm: number;
  readonly frequency: number;
  /** 0–1 */
  readonly volume: number;
}

const EDGE = 0.005;

/** Normalises any dot/dash glyph variant to "." and "-". */
export function normaliseCode(code: string): string {
  return code.replace(/[•·∙⋅●*]/g, '.').replace(/[−—–_▬]/g, '-');
}

function schedule(code: string, options: ToneOptions): MorseEvent[] {
  return morseSchedule(
    normaliseCode(code),
    options.wpm,
    Math.min(options.effectiveWpm, options.wpm),
  );
}

export class MorseTransmitter {
  private context: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private frame = 0;

  get playing(): boolean {
    return this.oscillator !== null;
  }

  play(code: string, options: ToneOptions, onLamp: (on: boolean) => void, onEnd: () => void): void {
    this.stop();
    const events = schedule(code, options);
    if (!events.length) return;
    this.context ??= new AudioContext();
    const ctx = this.context;
    void ctx.resume();

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = options.frequency;
    gain.gain.value = 0;
    oscillator.connect(gain).connect(ctx.destination);

    const start = ctx.currentTime + 0.08;
    const marks: { from: number; to: number }[] = [];
    let t = start;
    for (const event of events) {
      const duration = event.ms / 1000;
      if (event.on) {
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(options.volume, t + EDGE);
        gain.gain.setValueAtTime(options.volume, t + duration - EDGE);
        gain.gain.linearRampToValueAtTime(0, t + duration);
        marks.push({ from: t, to: t + duration });
      }
      t += duration;
    }
    const end = t;
    oscillator.start(start);
    oscillator.stop(end + 0.05);
    this.oscillator = oscillator;

    let lastLamp = false;
    const tick = () => {
      const now = ctx.currentTime;
      const on = marks.some((m) => now >= m.from && now < m.to);
      if (on !== lastLamp) {
        lastLamp = on;
        onLamp(on);
      }
      if (now < end && this.oscillator === oscillator) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
    oscillator.onended = () => {
      if (this.oscillator === oscillator) this.oscillator = null;
      cancelAnimationFrame(this.frame);
      onLamp(false);
      onEnd();
    };
  }

  stop(): void {
    cancelAnimationFrame(this.frame);
    if (this.oscillator) {
      const oscillator = this.oscillator;
      this.oscillator = null;
      try {
        oscillator.stop();
      } catch {
        /* already stopped */
      }
    }
  }
}

/** Renders the Morse schedule to a mono 16-bit PCM WAV blob. */
export function renderWav(code: string, options: ToneOptions, sampleRate = 22_050): Blob {
  const events = schedule(code, options);
  const total = Math.ceil((events.reduce((s, e) => s + e.ms, 0) / 1000 + 0.2) * sampleRate);
  const samples = new Int16Array(total);
  const edge = Math.floor(EDGE * sampleRate);
  let cursor = Math.floor(0.1 * sampleRate);
  for (const event of events) {
    const length = Math.floor((event.ms / 1000) * sampleRate);
    if (event.on) {
      for (let i = 0; i < length && cursor + i < total; i++) {
        const envelope = i < edge ? i / edge : i > length - edge ? (length - i) / edge : 1;
        const value = Math.sin((2 * Math.PI * options.frequency * (cursor + i)) / sampleRate);
        samples[cursor + i] = Math.round(value * envelope * options.volume * 0x7fff);
      }
    }
    cursor += length;
  }

  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const writeString = (offset: number, text: string) =>
    [...text].forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)));
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.byteLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.byteLength, true);
  return new Blob([header, samples.buffer as ArrayBuffer], { type: 'audio/wav' });
}
