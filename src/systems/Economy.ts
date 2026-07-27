import { ECONOMY_CONFIG } from '../utils/config';

export class Economy {
  gold: number;
  lives: number;

  constructor() {
    this.gold = ECONOMY_CONFIG.startingGold;
    this.lives = ECONOMY_CONFIG.startingLives;
  }

  static create(): Economy {
    const saved = Economy.load();
    const econ = new Economy();
    if (saved) {
      econ.gold = saved.gold;
      econ.lives = saved.lives;
    }
    return econ;
  }

  canAfford(cost: number): boolean {
    return this.gold >= cost;
  }

  spend(cost: number): boolean {
    if (this.gold < cost) return false;
    this.gold -= cost;
    return true;
  }

  earn(amount: number): void {
    this.gold += amount;
  }

  loseLife(): boolean {
    this.lives--;
    return this.lives <= 0;
  }

  killReward(baseReward: number, wave: number): number {
    return Math.floor(baseReward * (1 + wave * ECONOMY_CONFIG.killRewardMultiplier));
  }

  waveBonus(wave: number): number {
    return ECONOMY_CONFIG.waveBonusBase + wave * ECONOMY_CONFIG.waveBonusPerWave;
  }

  sellValue(baseCost: number, level: number): number {
    return Math.floor(baseCost * ECONOMY_CONFIG.sellRatio * level);
  }

  save(): void {
    const data = { gold: this.gold, lives: this.lives };
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wx = (globalThis as any).wx;
      if (wx && wx.setStorageSync) {
        wx.setStorageSync('xxl_economy', data);
        return;
      }
    } catch {
      // Not in WeChat environment
    }
    // Browser fallback: localStorage
    try {
      localStorage.setItem('xxl_economy', JSON.stringify(data));
    } catch {
      // Storage not available
    }
  }

  static load(): { gold: number; lives: number } | null {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wx = (globalThis as any).wx;
      if (wx && wx.getStorageSync) {
        const data = wx.getStorageSync('xxl_economy');
        if (data) return data as { gold: number; lives: number };
      }
    } catch {
      // Not in WeChat environment
    }
    // Browser fallback: localStorage
    try {
      const raw = localStorage.getItem('xxl_economy');
      if (raw) return JSON.parse(raw) as { gold: number; lives: number };
    } catch {
      // Storage not available
    }
    return null;
  }
}
