import { ECONOMY_CONFIG } from '../utils/GameConfig';

export class Economy {
  gold: number;
  lives: number;

  constructor() {
    this.gold = ECONOMY_CONFIG.startingGold;
    this.lives = ECONOMY_CONFIG.startingLives;
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
    return ECONOMY_CONFIG.waveBonusBase + (wave - 1) * ECONOMY_CONFIG.waveBonusPerWave;
  }

  sellValue(baseCost: number, level: number): number {
    return Math.floor(baseCost * ECONOMY_CONFIG.sellRatio * level);
  }
}
