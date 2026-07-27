import * as Phaser from 'phaser';
import { TOWER_TYPES, TILE_SIZE, DEPTH } from '../utils/config';
import type { TowerType } from '../entities/Tower';

export class TowerInfoPanel {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private tower: {
    scene: Phaser.Scene;
    x: number;
    y: number;
    towerType: TowerType;
    level: number;
    damage: number;
    range: number;
  } | null = null;

  private titleText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;
  private upgradeBg!: Phaser.GameObjects.Rectangle;
  private upgradeText!: Phaser.GameObjects.Text;
  private sellBg!: Phaser.GameObjects.Rectangle;
  private sellText!: Phaser.GameObjects.Text;

  onUpgrade: (() => void) | null = null;
  onSell: (() => void) | null = null;
  onClose: (() => void) | null = null;

  private panelWidth = 160;
  private panelHeight = 120;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(tower: {
    scene: Phaser.Scene;
    x: number;
    y: number;
    towerType: TowerType;
    level: number;
    damage: number;
    range: number;
  }): void {
    this.tower = tower;
    this.create();
  }

  private create(): void {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(DEPTH.PANEL);

    const panelX = this.tower!.x + TILE_SIZE / 2 + 20;
    const panelY = this.tower!.y - this.panelHeight / 2;

    this.container.x = Math.min(panelX, 400 - this.panelWidth - 10);
    this.container.y = Math.max(panelY, 10);

    const bg = this.scene.add.rectangle(0, 0, this.panelWidth, this.panelHeight, 0x000000, 0.85);
    bg.setStrokeStyle(2, 0xffffff, 0.5);
    this.container.add(bg);

    const config = TOWER_TYPES[this.tower!.towerType];
    this.titleText = this.scene.add
      .text(0, -45, `${config.name} Lv.${this.tower!.level}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5, 0.5);
    this.container.add(this.titleText);

    this.updateStats();

    const canUpgrade = this.tower!.level < 3;
    const upgradeCost = this.tower!.level * TOWER_TYPES[this.tower!.towerType].cost;

    this.upgradeBg = this.scene.add.rectangle(
      -35,
      25,
      60,
      22,
      canUpgrade ? 0x4caf50 : 0x555555,
      0.9,
    );
    this.upgradeBg.setInteractive({ useHandCursor: canUpgrade });
    if (canUpgrade) {
      this.upgradeBg.on('pointerdown', () => {
        if (this.onUpgrade) this.onUpgrade();
      });
    }
    this.container.add(this.upgradeBg);

    this.upgradeText = this.scene.add
      .text(-35, 25, canUpgrade ? `升级 ${upgradeCost}` : '已满级', {
        fontSize: '11px',
        color: canUpgrade ? '#ffffff' : '#888888',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5, 0.5);
    this.container.add(this.upgradeText);

    this.sellBg = this.scene.add.rectangle(35, 25, 60, 22, 0xff7043, 0.9);
    this.sellBg.setInteractive({ useHandCursor: true });
    this.sellBg.on('pointerdown', () => {
      if (this.onSell) this.onSell();
    });
    this.container.add(this.sellBg);

    const sellValue = Math.floor(TOWER_TYPES[this.tower!.towerType].cost * 0.5 * this.tower!.level);
    this.sellText = this.scene.add
      .text(35, 25, `出售 +${sellValue}`, {
        fontSize: '11px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5, 0.5);
    this.container.add(this.sellText);
  }

  updateStats(): void {
    if (!this.tower) return;
    this.statsText?.destroy();
    const dmg = this.tower.damage;
    const rng = this.tower.range;
    this.statsText = this.scene.add
      .text(0, -20, `伤害: ${dmg}  范围: ${rng}`, {
        fontSize: '11px',
        color: '#cccccc',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5, 0.5);
    this.container.add(this.statsText);
  }

  refresh(): void {
    if (!this.tower) return;
    this.titleText.setText(`${TOWER_TYPES[this.tower.towerType].name} Lv.${this.tower.level}`);
    this.updateStats();

    const canUpgrade = this.tower.level < 3;
    const upgradeCost = this.tower.level * TOWER_TYPES[this.tower.towerType].cost;
    this.upgradeText.setText(canUpgrade ? `升级 ${upgradeCost}` : '已满级');
    this.upgradeBg.setFillStyle(canUpgrade ? 0x4caf50 : 0x555555);
    this.upgradeText.setColor(canUpgrade ? '#ffffff' : '#888888');
  }

  hide(): void {
    if (this.container && this.container.active) {
      this.container.destroy();
    }
    this.tower = null;
  }
}
