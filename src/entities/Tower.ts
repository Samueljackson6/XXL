import * as Phaser from 'phaser';
import { TOWER_TYPES, TILE_SIZE } from '../utils/config';

export type TowerType = keyof typeof TOWER_TYPES;

export class Tower extends Phaser.GameObjects.Container {
  towerType: TowerType;
  level: number = 1;
  range: number;
  damage: number;
  fireRate: number;
  lastFired: number = 0;

  private rangeIndicator!: Phaser.GameObjects.Graphics;
  private baseSprite!: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number, type: TowerType) {
    super(scene, x, y);
    this.towerType = type;
    const config = TOWER_TYPES[type];
    this.damage = config.damage;
    this.fireRate = config.fireRate;
    this.range = config.range;
    this.level = 1;

    this.createVisuals();
    scene.add.existing(this);
  }

  private createVisuals(): void {
    const texKey = `tower_${this.towerType}`;
    this.baseSprite = this.scene.add.sprite(0, 0, texKey).setScale(2);
    this.add(this.baseSprite);

    this.rangeIndicator = this.scene.add.graphics();
    this.rangeIndicator.setVisible(false);
    this.drawRangeCircle();

    this.setSize(TILE_SIZE, TILE_SIZE);
    this.setInteractive({ useHandCursor: true });
  }

  private drawRangeCircle(): void {
    this.rangeIndicator.clear();
    this.rangeIndicator.lineStyle(1, 0xffffff, 0.3);
    this.rangeIndicator.strokeCircle(0, 0, this.range);
    this.rangeIndicator.fillStyle(0xffffff, 0.05);
    this.rangeIndicator.fillCircle(0, 0, this.range);
  }

  showRange(show: boolean): void {
    this.rangeIndicator.setVisible(show);
  }

  canFire(time: number): boolean {
    return time - this.lastFired >= this.fireRate;
  }

  fire(time: number): void {
    this.lastFired = time;
  }

  upgrade(): boolean {
    if (this.level >= 3) return false;
    this.level++;
    this.damage = Math.floor(this.damage * 1.5);
    this.range += 10;
    this.drawRangeCircle();
    this.baseSprite.setScale(2 + this.level * 0.2);
    return true;
  }

  getUpgradeCost(): number {
    return TOWER_TYPES[this.towerType].cost * this.level;
  }

  getSellValue(): number {
    return Math.floor(TOWER_TYPES[this.towerType].cost * 0.5 * this.level);
  }
}
