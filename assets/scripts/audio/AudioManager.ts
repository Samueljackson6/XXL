export type AudioEvents = {
  towerPlace: () => void;
  towerSell: () => void;
  towerUpgrade: () => void;
  enemyDeath: () => void;
  waveStart: () => void;
  waveComplete: () => void;
  gameOver: () => void;
};

export class AudioManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      const AnyWindow = globalThis as any;
      const AudioCtx = AnyWindow.AudioContext || AnyWindow.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.08): void {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not available
    }
  }

  play(event: keyof AudioEvents): void {
    switch (event) {
      case 'towerPlace':
        this.playTone(600, 0.08, 'square', 0.05);
        break;
      case 'towerSell':
        this.playTone(200, 0.15, 'sawtooth', 0.06);
        break;
      case 'towerUpgrade':
        this.playTone(800, 0.1, 'square', 0.05);
        setTimeout(() => this.playTone(1200, 0.1, 'square', 0.05), 100);
        break;
      case 'enemyDeath':
        this.playTone(300, 0.1, 'square', 0.04);
        break;
      case 'waveStart':
        this.playTone(400, 0.1, 'triangle', 0.06);
        setTimeout(() => this.playTone(600, 0.1, 'triangle', 0.06), 80);
        setTimeout(() => this.playTone(800, 0.15, 'triangle', 0.06), 160);
        break;
      case 'waveComplete':
        this.playTone(600, 0.1, 'triangle', 0.06);
        setTimeout(() => this.playTone(800, 0.1, 'triangle', 0.06), 100);
        setTimeout(() => this.playTone(1000, 0.15, 'triangle', 0.06), 200);
        break;
      case 'gameOver':
        this.playTone(400, 0.2, 'sawtooth', 0.06);
        setTimeout(() => this.playTone(300, 0.2, 'sawtooth', 0.06), 200);
        setTimeout(() => this.playTone(200, 0.4, 'sawtooth', 0.06), 400);
        break;
    }
  }

  dispose(): void {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
