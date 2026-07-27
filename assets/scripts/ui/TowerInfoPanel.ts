import { _decorator, Component, Node, Label, Sprite, Graphics, UITransform, Color, EventTouch } from 'cc';
import { TOWER_TYPES, TowerType, TILE_SIZE, DEPTH } from '../utils/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('TowerInfoPanel')
export class TowerInfoPanel extends Component {
  private panelNode: Node | null = null;
  private titleLabel: Label | null = null;
  private statsLabel: Label | null = null;
  private upgradeLabel: Label | null = null;
  private sellLabel: Label | null = null;
  private visible: boolean = false;

  onUpgrade: (() => void) | null = null;
  onSell: (() => void) | null = null;

  init(): void {
    this.createPanel();
  }

  private createPanel(): void {
    this.panelNode = new Node('tower_info_panel');
    this.panelNode.active = false;
    this.panelNode.setPosition(0, 0, 0);

    const transform = this.panelNode.addComponent(UITransform);
    transform.setContentSize(160, 120);

    const graphics = this.panelNode.addComponent(Graphics);
    graphics.fillColor = new Color(0, 0, 0, 217);
    graphics.rect(-80, -60, 160, 120);
    graphics.fill();
    graphics.strokeColor = new Color(255, 255, 255, 128);
    graphics.lineWidth = 2;
    graphics.rect(-80, -60, 160, 120);
    graphics.stroke();

    this.titleLabel = this.createLabel('title', 0, 35, 14, Color.WHITE);
    this.panelNode.addChild(this.titleLabel);

    this.statsLabel = this.createLabel('stats', 0, 10, 11, new Color(200, 200, 200, 255));
    this.panelNode.addChild(this.statsLabel);

    // Upgrade button
    const upgradeNode = new Node('upgrade');
    upgradeNode.setPosition(-35, -20, 0);
    const upgradeTransform = upgradeNode.addComponent(UITransform);
    upgradeTransform.setContentSize(60, 22);
    const upgradeGraphics = upgradeNode.addComponent(Graphics);
    upgradeGraphics.fillColor = new Color(76, 175, 80, 230);
    upgradeGraphics.rect(-30, -11, 60, 22);
    upgradeGraphics.fill();

    this.upgradeLabel = new Node('upgrade_text');
    this.upgradeLabel.setPosition(-35, -20, 0);
    const upgradeText = this.upgradeLabel.addComponent(Label);
    upgradeText.string = '升级';
    upgradeText.fontSize = 11;
    upgradeText.lineHeight = 13;
    upgradeText.color = Color.WHITE;
    const upgradeTextTransform = this.upgradeLabel.getComponent(UITransform)!;
    upgradeTextTransform.setContentSize(60, 22);

    const upgradeTouch = upgradeNode.addComponent(EventTouch);
    upgradeTouch.on(EventTouch.TOUCH_START, () => {
      if (this.onUpgrade) this.onUpgrade();
    });

    // Sell button
    const sellNode = new Node('sell');
    sellNode.setPosition(35, -20, 0);
    const sellTransform = sellNode.addComponent(UITransform);
    sellTransform.setContentSize(60, 22);
    const sellGraphics = sellNode.addComponent(Graphics);
    sellGraphics.fillColor = new Color(255, 112, 67, 230);
    sellGraphics.rect(-30, -11, 60, 22);
    sellGraphics.fill();

    this.sellLabel = new Node('sell_text');
    this.sellLabel.setPosition(35, -20, 0);
    const sellText = this.sellLabel.addComponent(Label);
    sellText.string = '出售';
    sellText.fontSize = 11;
    sellText.lineHeight = 13;
    sellText.color = Color.WHITE;
    const sellTextTransform = this.sellLabel.getComponent(UITransform)!;
    sellTextTransform.setContentSize(60, 22);

    const sellTouch = sellNode.addComponent(EventTouch);
    sellTouch.on(EventTouch.TOUCH_START, () => {
      if (this.onSell) this.onSell();
    });

    this.node.addChild(this.panelNode);
    this.panelNode.addChild(upgradeNode);
    this.panelNode.addChild(this.upgradeLabel);
    this.panelNode.addChild(sellNode);
    this.panelNode.addChild(this.sellLabel);
  }

  private createLabel(name: string, x: number, y: number, fontSize: number, color: Color): Node {
    const node = new Node(name);
    node.setPosition(x, y, 0);
    const label = node.addComponent(Label);
    label.string = '';
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 2;
    label.color = color;
    const transform = node.getComponent(UITransform)!;
    transform.setContentSize(140, fontSize + 4);
    return node;
  }

  show(x: number, y: number, towerType: TowerType, level: number, damage: number, range: number): void {
    if (!this.panelNode || !this.titleLabel || !this.statsLabel || !this.upgradeLabel) return;

    const config = TOWER_TYPES[towerType];
    this.titleLabel.getComponent(Label)!.string = `${config.name} Lv.${level}`;
    this.statsLabel.getComponent(Label)!.string = `伤害: ${damage}  范围: ${range}`;

    const canUpgrade = level < 3;
    const upgradeCost = level * config.cost;
    this.upgradeLabel.getComponent(Label)!.string = canUpgrade ? `升级 ${upgradeCost}G` : '已满级';

    this.panelNode.setPosition(x, y, 0);
    this.panelNode.active = true;
    this.visible = true;
  }

  refresh(): void {
    // Called after upgrade to update display
  }

  hide(): void {
    if (this.panelNode) {
      this.panelNode.active = false;
    }
    this.visible = false;
  }

  isVisible(): boolean {
    return this.visible;
  }
}
