
export class SoundManager {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  enabled: boolean = true;

  constructor() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3; // Global volume
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  playShoot(type: 'BASIC' | 'SNIPER' | 'BLASTER' | 'RAPID') {
    if (!this.enabled || !this.ctx || !this.masterGain) return;

    // Resume context if suspended (browser policy)
    if (this.ctx.state === 'suspended') {
        this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;

    switch (type) {
      case 'BASIC':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'SNIPER':
        osc.type = 'square';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'BLASTER':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case 'RAPID':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
    }
  }

  playExplosion() {
    if (!this.enabled || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // White noise buffer
    const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 sec
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = this.ctx.createGain();

    noise.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    noise.start(now);
    noise.stop(now + 0.3);
  }

  playMoney() {
      if (!this.enabled || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(1600, now + 0.1);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);

      osc.start(now);
      osc.stop(now + 0.2);
  }
}

export const soundManager = new SoundManager();
