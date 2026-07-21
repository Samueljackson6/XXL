import * as Phaser from 'phaser';
import type { Enemy } from '../entities/Enemy';

export class Projectile extends Phaser.GameObjects.Container {
  projX: number;
  projY: number;
  targetX: number;
  targetY: number;
  damage: number;
  speed: number;
  alive: boolean = true;
  projType: string;
  targetEnemy: Enemy | null;
  aoeRadius: number;
  slowEffect: { duration: number; factor: number } | null;

  private sprite!: Phaser.GameObjects.Sprite;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    targetEnemy: Enemy | null,
    damage: number,
    speed: number,
    type: string,
    aoeRadius: number,
    slowEffect: { duration: number; factor: number } | null,
  ) {
    super(scene, x, y);
    this.projX = x;
    this.projY = y;
    this.damage = damage;
    this.speed = speed;
    this.projType = type;
    this.targetEnemy = targetEnemy;
    this.aoeRadius = aoeRadius;
    this.slowEffect = slowEffect;

    if (targetEnemy && targetEnemy.alive) {
      this.targetX = targetEnemy.x;
      this.targetY = targetEnemy.y;
    } else {
      this.targetX = x;
      this.targetY = y;
    }

    const texKey = `projectile_${type}`;
    this.sprite = scene.add.sprite(0, 0, texKey).setScale(1.5);
    this.add(this.sprite);

    scene.add.existing(this);
  }

  update(delta: number): boolean {
    if (this.targetEnemy && this.targetEnemy.alive) {
      this.targetX = this.targetEnemy.x;
      this.targetY = this.targetEnemy.y;
    }

    const dx = this.targetX - this.projX;
    const dy = this.targetY - this.projY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.alive = false;
      return false;
    }

    const moveX = (dx / dist) * this.speed * delta;
    const moveY = (dy / dist) * this.speed * delta;
    this.projX += moveX;
    this.projY += moveY;
    this.setPosition(this.projX, this.projY);

    return true;
  }
}
