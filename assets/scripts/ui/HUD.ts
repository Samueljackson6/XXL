import { _decorator, Component, Node, Label, Graphics, Color, UITransform } from 'cc';
import { GAME_WIDTH, HUD_HEIGHT } from '../utils/GameConfig';

const { ccclass } = _decorator;

@ccclass('HUD')
export class HUD extends Component {
  private goldLabel: Label | null = null;
  private livesLabel: Label | null = null;
  private waveLabel: Label | null = null;

  onLoad(): void {
    this.createPanel();
  }

  private createPanel(): void {
    const bg = new Node('hud_bg');
    bg.setPosition(0, 0, 0);
    const bgTransform = bg.addComponent(UITransform);
    bgTransform.setContentSize(GAME_WIDTH, HUD_HEIGHT);

    const graphics = bg.addComponent(Graphics);
    graphics.fillColor = new Color(0, 0, 0, 217);
    graphics.rect(0, 0, GAME_WIDTH, HUD_HEIGHT);
    graphics.fill();

    this.livesLabel = this.createLabel('lives', 10, 14, 16, new Color(255, 68, 68, 255));
    this.node.addChild(this.livesLabel);

    this.goldLabel = this.createLabel('gold', GAME_WIDTH / 2, 14, 16, new Color(255, 215, 0, 255));
    this.goldLabel.getComponent(UITransform)!.setContentSize(100, 20);

    this.waveLabel = this.createLabel('wave', GAME_WIDTH - 10, 14, 16, Color.WHITE);
    this.waveLabel.getComponent(UITransform)!.setContentSize(100, 20);

    this.node.addChild(bg);
    this.node.addChild(this.goldLabel);
    this.node.addChild(this.waveLabel);
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
    transform.setContentSize(100, fontSize + 4);
    return node;
  }

  update(gold: number, lives: number, wave: number, totalWaves: number): void {
    if (this.goldLabel) {
      this.goldLabel.getComponent(Label)!.string = `GOLD ${gold}`;
    }
    if (this.livesLabel) {
      this.livesLabel.getComponent(Label)!.string = `HP ${lives}`;
    }
    if (this.waveLabel) {
      this.waveLabel.getComponent(Label)!.string = `WAVE ${wave}/${totalWaves}`;
    }
  }
}
