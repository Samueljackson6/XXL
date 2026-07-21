import * as Phaser from 'phaser';
import { GAME_WIDTH } from '../utils/config';

export class HUD {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private goldText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  private create(): void {
    this.container = this.scene.add.container(0, 0);

    const panel = this.scene.add.graphics();
    panel.fillStyle(0x000000, 0.6);
    panel.fillRect(0, 0, GAME_WIDTH, 44);
    this.container.add(panel);

    this.livesText = this.scene.add.text(10, 12, '', {
      fontSize: '16px',
      color: '#ff4444',
      fontFamily: 'Arial',
    });
    this.container.add(this.livesText);

    this.goldText = this.scene.add.text(GAME_WIDTH / 2, 12, '', {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'Arial',
    }).setOrigin(0.5, 0);
    this.container.add(this.goldText);

    this.waveText = this.scene.add.text(GAME_WIDTH - 10, 12, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(1, 0);
    this.container.add(this.waveText);
  }

  update(gold: number, lives: number, wave: number, totalWaves: number): void {
    this.goldText.setText(`💰 ${gold}`);
    this.livesText.setText(`❤️ ${lives}`);
    this.waveText.setText(`Wave ${wave}/${totalWaves}`);
  }
}
