import * as Phaser from 'phaser';
import { DEPTH } from '../utils/config';

export class FloatingText {
  private text: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    message: string,
    color = '#ffd700',
    size: 'normal' | 'large' = 'normal',
  ) {
    this.scene = scene;
    const fontSize = size === 'large' ? '28px' : '16px';
    const strokeThickness = size === 'large' ? 5 : 3;
    const duration = size === 'large' ? 1200 : 800;
    const riseDistance = size === 'large' ? -60 : -40;

    this.text = this.scene.add
      .text(x, y, message, {
        fontSize,
        color,
        fontFamily: 'Arial, sans-serif',
        stroke: '#000000',
        strokeThickness,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(DEPTH.FLOATING_TEXT)
      .setScale(size === 'large' ? 0.3 : 1);

    if (size === 'large') {
      this.scene.tweens.add({
        targets: this.text,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut',
      });
    }

    this.scene.tweens.add({
      targets: this.text,
      y: y + riseDistance,
      alpha: 0,
      duration,
      ease: 'Cubic.easeOut',
      onComplete: () => this.text.destroy(),
    });
  }
}
