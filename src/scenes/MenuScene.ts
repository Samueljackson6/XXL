import * as Phaser from 'phaser';
import { GAME_WIDTH } from '../utils/config';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.add
      .text(cx, 120, '塔防守卫战', {
        fontSize: '36px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const startBtn = this.add
      .text(cx, 300, '[ 开始游戏 ]', {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#4fc3f7',
        backgroundColor: '#1a1a2e',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setStyle({ color: '#ffffff' }));
    startBtn.on('pointerout', () => startBtn.setStyle({ color: '#4fc3f7' }));
    startBtn.on('pointerdown', () => this.scene.start('GameScene'));

    this.add
      .text(cx, 380, '放置防御塔，阻止敌人通过', {
        fontSize: '14px',
        color: '#888888',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 420, '3种塔 · 30波敌人 · 策略放置', {
        fontSize: '14px',
        color: '#666666',
      })
      .setOrigin(0.5);
  }
}
