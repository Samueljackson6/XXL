import * as Phaser from 'phaser';
import { GAME_WIDTH } from '../utils/config';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { survived: number; killed: number }): void {
    this.registry.set('survived', data.survived);
    this.registry.set('killed', data.killed);
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    const survived = this.registry.get('survived') as number;
    const killed = this.registry.get('killed') as number;

    this.add
      .text(cx, 150, '游戏结束', {
        fontSize: '40px',
        fontFamily: 'Arial, sans-serif',
        color: '#ff4444',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 230, `存活波次: ${survived} / 30`, {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 270, `击杀敌人: ${killed}`, {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const retryBtn = this.add
      .text(cx, 380, '[ 重新开始 ]', {
        fontSize: '22px',
        fontFamily: 'Arial, sans-serif',
        color: '#4fc3f7',
        backgroundColor: '#1a1a2e',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    retryBtn.on('pointerover', () => retryBtn.setStyle({ color: '#ffffff' }));
    retryBtn.on('pointerout', () => retryBtn.setStyle({ color: '#4fc3f7' }));
    retryBtn.on('pointerdown', () => this.scene.start('GameScene'));

    const menuBtn = this.add
      .text(cx, 440, '[ 返回主菜单 ]', {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#888888',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
