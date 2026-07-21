import * as Phaser from 'phaser';

export class FloatingText {
  private text: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, message: string, color = '#ffd700') {
    this.scene = scene;
    this.text = this.scene.add
      .text(x, y, message, {
        fontSize: '16px',
        color,
        fontFamily: 'Arial, sans-serif',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(90);

    this.scene.tweens.add({
      targets: this.text,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => this.text.destroy(),
    });
  }
}
