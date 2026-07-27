import { _decorator, Component, Node, Sprite, Color, Vec3, UITransform } from 'cc';
import { DEPTH, TOWER_TYPES } from '../utils/GameConfig';

const { ccclass, property } = _decorator;

export interface ProjectileConfig {
  x: number;
  y: number;
  targetNode: Node | null;
  damage: number;
  speed: number;
  type: string;
  aoeRadius: number;
  slowEffect: { duration: number; factor: number } | null;
}

@ccclass('Projectile')
export class Projectile extends Component {
  projX: number = 0;
  projY: number = 0;
  targetX: number = 0;
  targetY: number = 0;
  damage: number = 0;
  speed: number = 0;
  alive: boolean = true;
  projType: string = '';
  targetNode: Node | null = null;
  aoeRadius: number = 0;
  slowEffect: { duration: number; factor: number } | null = null;

  private sprite: Sprite | null = null;

  init(config: ProjectileConfig): void {
    this.projX = config.x;
    this.projY = config.y;
    this.damage = config.damage;
    this.speed = config.speed;
    this.projType = config.type;
    this.targetNode = config.targetNode;
    this.aoeRadius = config.aoeRadius;
    this.slowEffect = config.slowEffect;

    if (config.targetNode && config.targetNode.isValid) {
      const pos = config.targetNode.getPosition();
      this.targetX = pos.x;
      this.targetY = pos.y;
    } else {
      this.targetX = config.x;
      this.targetY = config.y;
    }

    this.node.setPosition(this.projX, this.projY, DEPTH.PROJECTILES);

    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(8, 8);

    this.sprite = this.node.addComponent(Sprite);
    const config_ = TOWER_TYPES[config.type as keyof typeof TOWER_TYPES];
    this.sprite.color = config_ ? Color.hex(config_.color) : Color.WHITE;
  }

  update(dt: number): boolean {
    if (this.targetNode && this.targetNode.isValid) {
      const pos = this.targetNode.getPosition();
      this.targetX = pos.x;
      this.targetY = pos.y;
    }

    const dx = this.targetX - this.projX;
    const dy = this.targetY - this.projY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.alive = false;
      return false;
    }

    const moveX = (dx / dist) * this.speed * dt;
    const moveY = (dy / dist) * this.speed * dt;
    this.projX += moveX;
    this.projY += moveY;
    this.node.setPosition(this.projX, this.projY, DEPTH.PROJECTILES);

    return true;
  }
}
