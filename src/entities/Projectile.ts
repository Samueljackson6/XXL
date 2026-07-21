import * as Phaser from 'phaser';

export class Projectile extends Phaser.GameObjects.Container {
  projX: number;
  projY: number;
  targetX: number;
  targetY: number;
  damage: number;
  speed: number;
  alive: boolean = true;
  projType: string;

  private sprite!: Phaser.GameObjects.Sprite;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    damage: number,
    type: string,
  ) {
    super(scene, x, y);
    this.projX = x;
    this.projY = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.damage = damage;
    this.speed = 400;
    this.projType = type;

    const texKey = `projectile_${type}`;
    this.sprite = scene.add.sprite(0, 0, texKey).setScale(1.5);
    this.add(this.sprite);

    scene.add.existing(this);
  }

  update(delta: number): boolean {
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
