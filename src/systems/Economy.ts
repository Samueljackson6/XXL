export class Economy {
  gold: number;
  lives: number;

  constructor() {
    this.gold = 150;
    this.lives = 20;
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
}
