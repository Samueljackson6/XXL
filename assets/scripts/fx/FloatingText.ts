import { _decorator, Component, Node, Label, Sprite, Color, tween, Vec3 } from 'cc';
import { DEPTH } from '../utils/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('FloatingText')
export class FloatingText extends Component {
  init(x: number, y: number, message: string, color: string = '#ffd700', size: 'normal' | 'large' = 'normal'): void {
    const fontSize = size === 'large' ? 28 : 16;
    const duration = size === 'large' ? 1.2 : 0.8;
    const riseDistance = size === 'large' ? -60 : -40;

    this.node.setPosition(x, y, DEPTH.FLOATING_TEXT);

    const label = this.node.addComponent(Label);
    label.string = message;
    label.fontSize = fontSize;
    label.lineHeight = fontSize;
    label.color = Color.hex(color.includes('#') ? parseInt(color.slice(1), 16) : 0xffd700);

    const transform = this.node.getComponent(UITransform)!;
    transform.setContentSize(100, fontSize + 4);

    const sprite = this.node.addComponent(Sprite);
    if (size === 'large') {
      const scale = 0.3;
      this.node.setScale(scale, scale, scale);
      tween(this.node)
        .to(0.3, { scale: new Vec3(1, 1, 1) })
        .start();
    }

    tween(this.node)
      .to(duration, { position: new Vec3(x, y + riseDistance, DEPTH.FLOATING_TEXT), _opacity: 0 })
      .call(() => this.node.destroy())
      .start();
  }
}
