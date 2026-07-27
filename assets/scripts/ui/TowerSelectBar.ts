import { _decorator, Component, Node, Label, Sprite, Color, Graphics, UITransform, EventTouch, input, Input, tween, Vec3 } from 'cc';
import { GAME_WIDTH, GAME_HEIGHT, TOWER_TYPES, TowerType } from '../utils/GameConfig';
import { GameScene } from '../core/GameScene';

const { ccclass, property } = _decorator;

interface TowerButton {
  node: Node;
  bg: Node;
  nameLabel: Label;
  costLabel: Label;
  highlight: Node | null;
  tween: any;
}

@ccclass('TowerSelectBar')
export class TowerSelectBar extends Component {
  onSelect: ((type: TowerType) => void) | null = null;
  onStartWave: (() => void) | null = null;

  private buttons: TowerButton[] = [];
  private startNode: Node | null = null;
  private startLabel: Label | null = null;
  private timerLabel: Label | null = null;
  private gameScene: GameScene | null = null;

  init(gameScene: GameScene): void {
    this.gameScene = gameScene;
    this.create();
  }

  private create(): void {
    const types: TowerType[] = ['arrow', 'cannon', 'frost'];
    let buttonX = 20;

    for (const type of types) {
      const config = TOWER_TYPES[type];
      const buttonNode = new Node(`btn_${type}`);
      buttonNode.setPosition(buttonX, GAME_HEIGHT - 50, 0);

      const bgTransform = buttonNode.addComponent(UITransform);
      bgTransform.setContentSize(80, 40);

      const bg = new Node('bg');
      bg.setPosition(0, 0, 0);
      const bgSprite = bg.addComponent(Sprite);
      const graphics = bg.addComponent(Graphics);
      graphics.fillColor = new Color(51, 51, 51, 230);
      graphics.rect(-40, -20, 80, 40);
      graphics.fill();
      graphics.strokeColor = new Color(parseInt(config.color.replace('#', ''), 16), 200);
      graphics.lineWidth = 2;
      graphics.rect(-40, -20, 80, 40);
      graphics.stroke();
      buttonNode.addChild(bg);

      const nameLabel = new Node('name');
      nameLabel.setPosition(0, -6, 0);
      const nameComp = nameLabel.addComponent(Label);
      nameComp.string = config.name;
      nameComp.fontSize = 12;
      nameComp.lineHeight = 14;
      nameComp.color = Color.WHITE;
      const nameTransform = nameLabel.getComponent(UITransform)!;
      nameTransform.setContentSize(80, 20);
      buttonNode.addChild(nameLabel);

      const costLabel = new Node('cost');
      costLabel.setPosition(0, 10, 0);
      const costComp = costLabel.addComponent(Label);
      costComp.string = `${config.cost}G`;
      costComp.fontSize = 11;
      costComp.lineHeight = 13;
      costComp.color = new Color(255, 215, 0, 255);
      const costTransform = costLabel.getComponent(UITransform)!;
      costTransform.setContentSize(80, 16);
      buttonNode.addChild(costLabel);

      const eventTouch = buttonNode.addComponent(EventTouch);
      eventTouch.on(EventTouch.TOUCH_START, () => {
        if (this.onSelect) this.onSelect(type);
      }, this);

      this.buttons.push({
        node: buttonNode,
        bg: bg,
        nameLabel: nameComp,
        costLabel: costComp,
        highlight: null,
        tween: null,
      });

      this.node.addChild(buttonNode);
      buttonX += 100;
    }

    // Start wave button
    this.startNode = new Node('start_btn');
    this.startNode.setPosition(GAME_WIDTH - 100, GAME_HEIGHT - 50, 0);

    const startTransform = this.startNode.addComponent(UITransform);
    startTransform.setContentSize(80, 40);

    const startBg = new Node('start_bg');
    const startBgSprite = startBg.addComponent(Sprite);
    const startGraphics = startBg.addComponent(Graphics);
    startGraphics.fillColor = new Color(76, 175, 80, 230);
    startGraphics.rect(-40, -20, 80, 40);
    startGraphics.fill();
    this.startNode.addChild(startBg);

    this.startLabel = new Node('start_text');
    this.startLabel.setPosition(0, 0, 0);
    const startLabelComp = this.startLabel.addComponent(Label);
    startLabelComp.string = '开始';
    startLabelComp.fontSize = 14;
    startLabelComp.lineHeight = 16;
    startLabelComp.color = Color.WHITE;
    const startLabelTransform = this.startLabel.getComponent(UITransform)!;
    startLabelTransform.setContentSize(80, 30);
    this.startNode.addChild(this.startLabel);

    const startTouch = this.startNode.addComponent(EventTouch);
    startTouch.on(EventTouch.TOUCH_START, () => {
      if (this.onStartWave) this.onStartWave();
    }, this);

    this.node.addChild(this.startNode);

    // Timer label
    this.timerLabel = new Node('timer');
    this.timerLabel.setPosition(GAME_WIDTH / 2, GAME_HEIGHT - 12, 0);
    const timerComp = this.timerLabel.addComponent(Label);
    timerComp.string = '';
    timerComp.fontSize = 12;
    timerComp.lineHeight = 14;
    timerComp.color = Color.WHITE;
    const timerTransform = this.timerLabel.getComponent(UITransform)!;
    timerTransform.setContentSize(100, 20);
    this.node.addChild(this.timerLabel);
  }

  updateState(state: string): void {
    if (!this.startNode || !this.startLabel) return;

    switch (state) {
      case 'prepare':
        this.startNode.active = true;
        this.startLabel.string = '跳过';
        if (this.timerLabel) this.timerLabel.node.active = true;
        break;
      case 'fighting':
        this.startNode.active = false;
        if (this.timerLabel) this.timerLabel.node.active = false;
        break;
      case 'intermission':
        this.startNode.active = true;
        this.startLabel.string = '下一波';
        if (this.timerLabel) this.timerLabel.node.active = false;
        break;
      default:
        this.startNode.active = true;
        this.startLabel.string = '开始';
        if (this.timerLabel) this.timerLabel.node.active = false;
    }
  }

  updateTimer(remaining: number): void {
    if (this.timerLabel && this.gameScene && this.gameScene.getState() === 'prepare') {
      this.timerLabel.string = `准备: ${Math.ceil(remaining / 1000)}s`;
    }
  }

  updateAffordability(economy: { gold: number }): void {
    const types: TowerType[] = ['arrow', 'cannon', 'frost'];
    for (let i = 0; i < this.buttons.length; i++) {
      const type = types[i];
      const config = TOWER_TYPES[type];
      const canAfford = economy.gold >= config.cost;
      const alpha = canAfford ? 1 : 0.4;
      this.buttons[i].node.setScale(1, 1, 1);
      this.buttons[i].costLabel!.color = canAfford ? new Color(255, 215, 0, 255) : new Color(128, 128, 128, 255);
    }
  }

  setSelectedType(type: TowerType | null): void {
    const types: TowerType[] = ['arrow', 'cannon', 'frost'];
    for (let i = 0; i < this.buttons.length; i++) {
      const btnType = types[i];
      const button = this.buttons[i];

      if (btnType === type) {
        button.bg.children.forEach((child: Node) => {
          const g = child.getComponent(Graphics);
          if (g) {
            g.clear();
            g.strokeColor = new Color(255, 255, 255, 255);
            g.lineWidth = 3;
            g.rect(-42, -22, 84, 44);
            g.stroke();
          }
        });
      } else {
        const config = TOWER_TYPES[btnType];
        button.bg.children.forEach((child: Node) => {
          const g = child.getComponent(Graphics);
          if (g) {
            g.clear();
            g.fillColor = new Color(51, 51, 51, 230);
            g.rect(-40, -20, 80, 40);
            g.fill();
            g.strokeColor = new Color(parseInt(config.color.replace('#', ''), 16), 200);
            g.lineWidth = 2;
            g.rect(-40, -20, 80, 40);
            g.stroke();
          }
        });
      }
    }
  }
}
