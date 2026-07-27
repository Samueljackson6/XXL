import { _decorator, Component, Node, Sprite, Graphics, Color, Vec3, UITransform } from 'cc';
import { TowerType, TOWER_TYPES, DEPTH } from '../utils/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('Tower')
export class Tower extends Component {
  towerType: TowerType;
  level: number = 1;
  range: number = 0;
  damage: number = 0;
  fireRate: number = 0;
  lastFired: number = 0;

  private rangeNode: Node | null = null;
  private baseSprite: Sprite | null = null;

  init(type: TowerType, x: number, y: number): void {
    this.towerType = type;
    const config = TOWER_TYPES[type];
    this.damage = config.damage;
    this.fireRate = config.fireRate;
    this.range = config.range;
    this.level = 1;
    this.lastFired = 0;

    this.node.setPosition(x, y, DEPTH.TOWERS);
    this.createVisuals();
  }

  private createVisuals(): void {
    const config = TOWER_TYPES[this.towerType];

    const transform = this.node.getComponent(UITransform)!;
    transform.setContentSize(48, 48);

    this.baseSprite = this.node.addComponent(Sprite);
    this.baseSprite.color = Color.hex(config.color);

    this.rangeNode = new Node('range_indicator');
    this.rangeNode.setPosition(0, 0, 0);
    this.rangeNode.active = false;
    this.drawRangeCircle();
    this.node.addChild(this.rangeNode);
  }

  private drawRangeCircle(): void {
    if (!this.rangeNode) return;
    const graphics = this.rangeNode.getComponent(Graphics);
    if (graphics) {
      graphics.clear();
      graphics.strokeColor = new Color(255, 255, 255, 80);
      graphics.lineWidth = 1;
      graphics.circle(0, 0, this.range);
      graphics.stroke();
      graphics.fillColor = new Color(255, 255, 255, 13);
      graphics.circle(0, 0, this.range);
      graphics.fill();
    }
  }

  showRange(show: boolean): void {
    if (this.rangeNode) {
      this.rangeNode.active = show;
    }
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
    if (this.rangeNode) {
      this.rangeNode.removeComponent(Graphics);
      this.drawRangeCircle();
    }
    const transform = this.node.getComponent(UITransform)!;
    const scale = 1 + this.level * 0.1;
    transform.setContentSize(48 * scale, 48 * scale);
    return true;
  }

  getUpgradeCost(): number {
    return Math.floor(TOWER_TYPES[this.towerType].cost * this.level);
  }

  getSellValue(): number {
    return Math.floor(TOWER_TYPES[this.towerType].cost * 0.5 * this.level);
  }
}
