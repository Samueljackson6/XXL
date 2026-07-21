import * as Phaser from 'phaser';
import { ENEMY_TYPES } from '../utils/config';

export type EnemyType = keyof typeof ENEMY_TYPES;

export class Enemy extends Phaser.GameObjects.Container {
  enemyType: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  distanceTraveled: number = 0;
  alive: boolean = true;

  private sprite!: Phaser.GameObjects.Sprite;
  private hpBarBg!: Phaser.GameObjects.Sprite;
  private hpBarFill!: Phaser.GameObjects.Sprite;
  private slowTimer: number = 0;
  private slowFactor: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType) {
    super(scene, x, y);
    this.enemyType = type;
    const config = ENEMY_TYPES[type];
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.speed = config.speed;
    this.reward = config.reward;

    this.createVisuals();
    scene.add.existing(this);
  }

  private createVisuals(): void {
    const texKey = `enemy_${this.enemyType}`;
    this.sprite = this.scene.add.sprite(0, 0, texKey).setScale(1.8);

    this.hpBarBg = this.scene.add.sprite(0, -16, 'hp_bg');
    this.hpBarFill = this.scene.add.sprite(0, -16, 'hp_fill');
    this.hpBarFill.setOrigin(0, 0.5);

    this.add([this.sprite, this.hpBarBg, this.hpBarFill]);
  }

  move(delta: number): void {
    this.distanceTraveled += this.speed * this.slowFactor * delta;
  }

  applySlow(duration: number, factor: number): void {
    this.slowFactor = factor;
    this.slowTimer = duration;
    this.sprite.setTint(0x81d4fa);
  }

  updateHpBar(): void {
    const ratio = Math.max(0, this.hp / this.maxHp);
    this.hpBarFill.setScale(ratio, 1);
    this.hpBarFill.setX(-12 * (1 - ratio));
    if (ratio < 0.3) {
      this.hpBarFill.setTint(0xff0000);
    }
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.updateHpBar();
    return this.hp <= 0;
  }

  updateSlow(delta: number): void {
    if (this.slowTimer > 0) {
      this.slowTimer -= delta * 1000;
      if (this.slowTimer <= 0) {
        this.slowFactor = 1;
        this.sprite.clearTint();
      }
    }
  }

  getEffectiveSpeed(): number {
    return this.speed * this.slowFactor;
  }
}
