import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TOWER_TYPES } from '../utils/config';
import { type TowerType } from '../entities/Tower';
import { WAVE_STATE } from '../systems/CombatState';
import type { WaveState } from '../systems/CombatState';

export class TowerSelectBar {
  private scene: Phaser.Scene;
  private state: WaveState;

  onSelect: ((type: TowerType) => void) | null = null;
  onStartWave: (() => void) | null = null;

  private container!: Phaser.GameObjects.Container;
  private buttons: {
    bg: Phaser.GameObjects.Rectangle;
    nameText: Phaser.GameObjects.Text;
    costText: Phaser.GameObjects.Text;
  }[] = [];
  private startButton!: Phaser.GameObjects.Container;
  private startBg!: Phaser.GameObjects.Rectangle;
  private startText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, state: WaveState) {
    this.scene = scene;
    this.state = state;
    this.create();
  }

  private create(): void {
    this.container = this.scene.add.container(0, GAME_HEIGHT - 60);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRect(0, 0, GAME_WIDTH, 60);
    this.container.add(bg);

    const types: TowerType[] = ['arrow', 'cannon', 'frost'];
    let buttonX = 20;

    for (const type of types) {
      const config = TOWER_TYPES[type];
      const buttonContainer = this.scene.add.container(buttonX, 10);

      const bgRect = this.scene.add.rectangle(0, 0, 80, 40, 0x333333, 0.9);
      bgRect.setStrokeStyle(2, config.color, 0.8);
      bgRect.setInteractive({ useHandCursor: true });
      bgRect.on('pointerdown', () => {
        if (this.onSelect) this.onSelect(type);
      });
      buttonContainer.add(bgRect);

      const nameText = this.scene.add
        .text(0, -6, config.name, {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
        })
        .setOrigin(0.5, 0.5);
      buttonContainer.add(nameText);

      const costText = this.scene.add
        .text(0, 10, `${config.cost}`, {
          fontSize: '11px',
          color: '#ffd700',
          fontFamily: 'Arial, sans-serif',
        })
        .setOrigin(0.5, 0.5);
      buttonContainer.add(costText);

      this.container.add(buttonContainer);
      this.buttons.push({ bg: bgRect, nameText, costText });
      buttonX += 100;
    }

    const startX = GAME_WIDTH - 100;
    this.startButton = this.scene.add.container(startX, 10);

    this.startBg = this.scene.add.rectangle(0, 0, 80, 40, 0x4caf50, 0.9);
    this.startBg.setInteractive({ useHandCursor: true });
    this.startBg.on('pointerdown', () => {
      if (this.onStartWave) this.onStartWave();
    });
    this.startButton.add(this.startBg);

    this.startText = this.scene.add
      .text(0, 0, '开始', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5, 0.5);
    this.startButton.add(this.startText);

    this.container.add(this.startButton);

    this.timerText = this.scene.add
      .text(GAME_WIDTH / 2, 20, '', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5, 0.5);
    this.container.add(this.timerText);

    this.updateState(this.state);
  }

  updateState(state: WaveState): void {
    this.state = state;

    switch (state) {
      case WAVE_STATE.PREPARE:
        this.startBg.setVisible(true);
        this.startText.setVisible(true);
        this.startText.setText('跳过');
        this.timerText.setVisible(true);
        break;
      case WAVE_STATE.FIGHTING:
        this.startBg.setVisible(false);
        this.startText.setVisible(false);
        this.timerText.setVisible(false);
        break;
      case WAVE_STATE.INTERMISSION:
        this.startBg.setVisible(true);
        this.startText.setVisible(true);
        this.startText.setText('下一波');
        this.timerText.setVisible(false);
        break;
      default:
        this.startBg.setVisible(true);
        this.startText.setVisible(true);
        this.startText.setText('开始');
        this.timerText.setVisible(false);
    }
  }

  updateTimer(remaining: number): void {
    if (this.state === WAVE_STATE.PREPARE) {
      this.timerText.setText(`准备: ${Math.ceil(remaining)}s`);
    }
  }

  updateAffordability(canAfford: Record<TowerType, boolean>): void {
    for (let i = 0; i < this.buttons.length; i++) {
      const type = ['arrow', 'cannon', 'frost'][i] as TowerType;
      const button = this.buttons[i];
      const alpha = canAfford[type] ? 0.9 : 0.4;
      button.bg.setAlpha(alpha);
    }
  }

  setSelectedType(type: TowerType | null): void {
    for (let i = 0; i < this.buttons.length; i++) {
      const btnType = ['arrow', 'cannon', 'frost'][i] as TowerType;
      const button = this.buttons[i];
      if (btnType === type) {
        button.bg.setStrokeStyle(3, 0xffffff, 1);
      } else {
        const config = TOWER_TYPES[btnType];
        button.bg.setStrokeStyle(2, config.color, 0.8);
      }
    }
  }
}
