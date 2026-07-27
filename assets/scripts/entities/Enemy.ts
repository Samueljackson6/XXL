import { _decorator, Component, Node, Sprite, Color, tween, Vec3, UITransform } from 'cc';
import { EnemyType, ENEMY_TYPES, DEPTH } from '../utils/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
  enemyType: EnemyType;
  hp: number = 0;
  maxHp: number = 0;
  speed: number = 0;
  reward: number = 0;
  distanceTraveled: number = 0;
  alive: boolean = true;
  slowTimer: number = 0;
  slowFactor: number = 1;

  private sprite: Sprite | null = null;
  private hpBarBg: Node | null = null;
  private hpBarFill: Node | null = null;

  init(type: EnemyType, x: number, y: number): void {
    this.enemyType = type;
    const config = ENEMY_TYPES[type];
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.speed = config.speed;
    this.reward = config.reward;
    this.distanceTraveled = 0;
    this.alive = true;
    this.slowTimer = 0;
    this.slowFactor = 1;

    this.node.setPosition(x, y, DEPTH.ENEMIES);
    this.createVisuals();
  }

  private createVisuals(): void {
    const config = ENEMY_TYPES[this.enemyType];
    this.sprite = this.node.addComponent(Sprite);
    this.sprite.color = Color.hex(config.color);

    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(24, 24);

    this.hpBarBg = new Node('hp_bar_bg');
    this.hpBarBg.setPosition(0, -16, 0);
    this.hpBarBg.addComponent(UITransform);
    this.hpBarBg.parent = this.node;

    this.hpBarFill = new Node('hp_bar_fill');
    this.hpBarFill.setPosition(-10, -16, 0);
    this.hpBarFill.addComponent(UITransform);
    this.hpBarFill.parent = this.node;
  }

  move(delta: number): void {
    this.distanceTraveled += this.speed * this.slowFactor * delta;
  }

  applySlow(duration: number, factor: number): void {
    if (factor < this.slowFactor) {
      this.slowFactor = factor;
      this.slowTimer = duration;
      if (this.sprite) {
        this.sprite.color = Color.hex('#81d4fa');
      }
    }
  }

  updateHpBar(): void {
    if (!this.hpBarFill) return;
    const ratio = Math.max(0, this.hp / this.maxHp);
    const transform = this.hpBarFill.getComponent(UITransform);
    if (transform) {
      transform.setContentSize(20 * ratio, 4);
      this.hpBarFill.setPosition(-10 + 10 * (1 - ratio), 0, 0);
    }
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.updateHpBar();
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  updateSlow(delta: number): void {
    if (this.slowTimer > 0) {
      this.slowTimer -= delta * 1000;
      if (this.slowTimer <= 0) {
        this.slowFactor = 1;
        if (this.sprite) {
          const config = ENEMY_TYPES[this.enemyType];
          this.sprite.color = Color.hex(config.color);
        }
      }
    }
  }

  getEffectiveSpeed(): number {
    return this.speed * this.slowFactor;
  }

  destroySelf(): void {
    tween(this.node)
      .to(0.2, { scale: new Vec3(0.1, 0.1, 0.1) })
      .call(() => this.node.destroy())
      .start();
  }
}
